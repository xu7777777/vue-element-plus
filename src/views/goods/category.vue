<template>
  <div class="app-container">
    <el-input
      v-model="filterText"
      placeholder="输入关键字进行过滤"
    />
    <el-tree
      ref="tree"
      accordion
      class="filter-tree"
      node-key="id"
      :data="categoryList"
      :filter-node-method="filterNode"
      :node-collapse="closeNode"
      @node-click="labelClick"
    >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span>{{ node.label }}</span>
        <span>
          <el-button
            style="margin-right: 40px; font-weight: 700;"
            type="text"
            size="mini"
            @click="() => edit(data)"
          >
            Edit
          </el-button>
          <el-button
            style="margin-right: 40px; font-weight: 700;"
            type="text"
            size="mini"
            @click="() => append(data)"
          >
            Append
          </el-button>
          <el-button
            style="margin-right: 40px; font-weight: 700;"
            type="text"
            size="mini"
            @click="() => remove(node, data)"
          >
            Delete
          </el-button>
        </span>
      </span>
    </el-tree>
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'Edit Category':'New Category'" custom-class="dr" @close="handleDialogClose">
      <el-form :model="category" label-width="80px" label-position="left">
        <el-form-item v-if="dialogType !== 'new'" label="id">
          <el-tag>{{ category.categoryId }}</el-tag>
        </el-form-item>
        <el-form-item label="Label">
          <el-input v-model="category.label" placeholder="Category Label" />
        </el-form-item>
        <el-form-item label="Is Parent ?" label-width="160px;">
          <el-switch v-model="category.isParent" :disabled="switchDisable" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">Cancel</el-button>
        <el-button type="primary" :disabled="isdisable" @click="confirmCategory">Confirm</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
import { getCategories, addCategory, deleteCategory, updateCategory } from '@/api/goods'

const defaultCategory = {
  categoryId: '',
  label: '',
  parentId: '',
  isParent: true
}

export default {
  name: 'Category',
  data() {
    return {
      filterText: '',
      categoryList: [],
      cid: 0,
      isdisable: false,
      category: Object.assign({}, defaultCategory),
      dialogVisible: false,
      dialogType: 'new',
      parent: {},
      switchDisable: false
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.getCategories()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    getCategories() {
      getCategories(this.cid).then(resp => {
        this.categoryList = resp.data
        this.children = this.categoryList
      })
        .catch(() => {
          console.log('Get category error!')
        })
    },
    labelClick(obj) {
      getCategories(obj.id).then(resp => {
        obj.children = resp.data
        this.parent = obj
      })
    },
    closeNode(obj) {
      obj.children = null
    },
    append(data) {
      this.dialogType = 'new'
      this.category.label = ''
      this.dialogVisible = true
      this.switchDisable = false
      this.category.isParent = true
      this.category.parentId = data.id
    },
    edit(data) {
      try {
        this.switchDisable = data.children.length > 0
      } catch (e) {
        this.switchDisable = true
      }
      this.parent = data
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.category.label = data.label
      this.category.categoryId = data.id
      this.category.isParent = data.isParent
    },
    async confirmCategory() {
      this.isdisable = true
      const isEdit = this.dialogType === 'edit'

      if (this.category.label === '' || this.category.label === null) {
        this.$notify.warning({
          title: '警告',
          message: '类目标签不能为空！'
        })
        this.isdisable = false
        return
      }

      if (isEdit) {
        await updateCategory(this.category)
        this.parent.label = this.category.label
        this.parent.isParent = this.category.isParent
      } else {
        const resp = await addCategory(this.category)
        console.log(resp)
        this.category.categoryId = resp.data
        const newChild = { categoryId: resp.data, label: this.category.label, isParent: this.isParent, children: [] }
        if (!this.parent.children) {
          this.$set(this.parent, 'children', [])
        }
        this.parent.children.push(newChild)
        this.parent.isParent = true
      }

      const { categoryId, label, isParent } = this.category
      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
            <div>Category Id: <i class="i-style">${categoryId}</i></div>
            <div>Category Label: <i class="i-style">${label}</i></div>
            <div>Category Is Parent ?: <i class="i-style">${isParent}</i></div>
          `,
        type: 'success'
      })
    },
    handleDialogClose() {
      this.isdisable = false
    },
    remove(node, data) {
      this.$confirm('确定要删除该类目吗? 如果删除该类目，则该类目下所有商品都将被删除!', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await deleteCategory(data.id).then(resp => {
            this.$message({
              type: 'success',
              message: resp.data
            })
            const parent = node.parent
            const children = parent.data.children || parent.data
            const index = children.findIndex(d => d.id === data.id)
            children.splice(index, 1)
          }).catch(() => {
          })
        })
        .catch(err => { console.error(err) })
    }
  }
}
</script>

<style>
  .app-container {
    margin-top: 30px;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    padding-left: 40px;
    padding-right: 160px;
  }
  .filter-tree {
    margin-top: 40px;
  }
  .i-style {
    font-weight: 600;
    font-size: 14px;
    color: #002742;
  }
</style>
