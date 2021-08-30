<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    class="input-with-select"
                    v-model="queryInfo.query"
                    clearable
                    @clear="getUserList">
            <el-button slot="append"
                       icon="el-icon-search"
                       @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"  @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <!-- scope.row拿到userlist每一个对象数据 -->
          <template v-slot:default="scope">
            <el-switch v-model="scope.row.mg_state"  @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot:default="scope">
            <!-- 修改 -->
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除 -->
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning"
                         icon="el-icon-setting"
                         size="mini"
                         @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <el-form :model="editForm"
               :rules="editFormRules"
               ref="editFormRef"
               label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed">
      <!-- 树型控件 -->
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          分配的新角色：
          <!-- v-model对选择的值双向绑定，:label显示的选项的值，:value赋值给v-model的值 -->
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolelist"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
  export default {
    name: "Users",
    data() {
      //验证邮箱的规则
      let checkEmail = (rule, value, callback) => {
        //验证邮箱的正则
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9])+(\.[a-zA-Z0-9])+/
        if (regEmail.test(value)) {
          return callback()
        }
        callback(new Error("请输入合法的邮箱"))
      }

      //验证手机号的规则
      let checkMobile = (rule, value, callback) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|[17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return callback()
        }
        callback(new Error("请输入合法的手机号"))
      }

      return {
        //获取用户列表的参数对象
        queryInfo: {
          //搜索关键字
          query: '',
          //当前页数
          pagenum: 1,
          //每页显示条数
          pagesize: 2
        },
        userlist: [],
        total: 0,
        //控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        //控制修改用户对话框的显示与隐藏
        editDialogVisible: false,
        //添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        //查询到的用户信息对象
        editForm: {},
        //添加用户表单的验证规则对象
        addFormRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            //validator指定校验规则函数
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入手机', trigger: 'blur' },
            //validator指定校验规则函数
            { validator: checkMobile, trigger: 'blur' }
          ]
        },
        //修改表单的验证规则对象
        editFormRules: {
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            //validator指定校验规则函数
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入手机', trigger: 'blur' },
            //validator指定校验规则函数
            { validator: checkMobile, trigger: 'blur' }
          ]
        },
        //控制分配角色对话框的显示与隐藏
        setRoleDialogVisible: false,
        //需要被分配角色的用户信息
        userInfo: {},
        //所有角色的数据列表
        rolelist: [],
        //选中的id值
        selectedRoleId:''
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        const { data: res } = await this.$http.get('users', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取用户列表失败！')
        }
        this.userlist = res.data.users
        this.total = res.data.total
      },
      //监听pagesize改变事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      //监听页码值改变事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      //监听switch开关状态的改变
      async userStateChanged(userInfo) {
        const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('更新用户状态失败！')
        }
        this.$message.success('更新用户状态成功！')
      },
      //监听添加用户对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      //点击按钮添加新用户
      addUser() {
        //validate()根据规则对整个表单进行验证
        this.$refs.addFormRef.validate(async valid => {
          //验证失败
          if (!valid) {
            return
          }
          //验证成功，发送请求添加新用户
          const {data: res} = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            this.$message.error("添加用户失败！")
          }
          this.$message.success("添加用户成功！")
          //隐藏添加用户对话框
          this.addDialogVisible = false
          //重新获取用户列表
          await this.getUserList()
        })
      },
      //展示编辑用户的对话框
      async showEditDialog(id) {
        //根据id查询用户信息
        const {data: res} = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error("查询用户信息失败！")
        }
        this.editForm = res.data
        this.editDialogVisible = true
      },
      //监听修改用户对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      //修改用户信息并提交
      editUserInfo() {
        //验证信息
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) {
            return
          }
          //发起修改用户信息的数据请求
          const {data: res} = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) {
            return this.$message.error("更新用户信息失败！")
          }
          //关闭对话框
          this.editDialogVisible = false
          //提示修改成功
          this.$message.success("更新用户信息成功！")
          //刷新数据列表
          await this.getUserList()
        })
      },
      //根据id删除用户
      async removeUserById(id) {
        //弹框询问用户是否删除
        //this.$confirm(提示信息, 弹框标题, 配置对象)
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error => error)
        //用户点击确认，返回字符串confirm
        //用户点击取消，返回字符串cancel
        if (confirmResult !== 'confirm') {
          return this.$message.info("已取消删除")
        }
        //发送请求删除用户
        const {data: res} = await this.$http.delete('users/' +id)
        if (res.meta.status !== 200) {
          return this.$message.error("删除用户失败！")
        }
        this.$message.success("删除用户成功！")
        await this.getUserList()
      },
      //展示分配角色对话框
      async setRole(userInfo) {
        this.userInfo = userInfo

        //在展示对话框之前获取所有的用户列表
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error("获取角色列表失败！")
        }
        this.rolelist = res.data

        this.setRoleDialogVisible = true
      },
      //点击按钮分配角色
      async saveRoleInfo() {
        if (!this.selectedRoleId) {
          return this.$message.error('请选择要分配的角色！')
        }
        const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectedRoleId})
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色失败！')
        }
        this.$message.success('更新角色成功！')
        await this.getUserList()
        this.setRoleDialogVisible = false
      },
      //监听分配角色对话框的关闭
      setRoleDialogClosed() {
        this.selectedRoleId = ''
        this.userInfo = ''
      }
    }
  }
</script>

<style lang="less" scoped>

</style>