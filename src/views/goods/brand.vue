<template>
  <div class="app-container">
    <el-input
      v-model="text"
      placeholder="Please enter the brand's id or title"
      style="width:300px;"
      prefix-icon="el-icon-document"
      @keyup.native="getBrands"
    />
    <el-button
      :loading="downloadLoading"
      style="margin-bottom:20px;"
      type="primary"
      icon="el-icon-search"
      @click="getBrands"
    >
      Search
    </el-button>
    <el-button type="primary" @click="addBrand">New Brand</el-button>
    <div class="container-box">
      <el-table v-loading="listLoading" :data="list" :default-sort="{prop: 'heat', order: 'descending'}" element-loading-text="拼命加载中" border fit highlight-current-row>
        <el-table-column align="center" label="ID" width="95">
          <template slot-scope="scope">
            {{ scope.row.brandId }}
          </template>
        </el-table-column>
        <el-table-column label="品牌名称" width="265" align="center">
          <template slot-scope="scope">
            <span style="font-weight: 800;">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="品牌标志" width="285" align="center">
          <template slot-scope="scope">
            <img v-if="scope.row.image" :src="scope.row.image" width="130" height="40">
            <el-tag v-else width="140" height="50">Not uploaded yet</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="heat" sortable label="热度" width="135" align="center">
          <template slot-scope="scope">
            <el-tag class="heat-style">{{ scope.row.heat }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="Operations" width="340">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="updateBrand(scope)">Edit</el-button>
            <el-button type="danger" size="small" @click="deleteBrand(scope)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          class="pagination"
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="current"
          :page-sizes="pageSize"
          :page-size="size"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'Edit Brand':'New Brand'" custom-class="dr" @close="handleDialogClose">
      <el-form :model="brand" label-width="80px" :rules="rules" label-position="left">
        <el-form-item v-if="dialogType !== 'new'" label="id">
          <el-tag>{{ brand.brandId }}</el-tag>
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="brand.name" placeholder="Brand Name" />
        </el-form-item>
        <el-form-item v-if="dialogType !== 'new'" label="Heat">
          <el-tag class="heat-style">{{ brand.heat }}</el-tag>
        </el-form-item>
        <el-form-item v-if="dialogType !== 'new'" label="Original Sign" label-width="130px">
          <img v-if="brand.image" :src="brand.image" class="origin-image" width="130px" height="40px">
          <el-tag v-else width="140" class="origin-image" height="50">Not uploaded yet</el-tag>
        </el-form-item>
        <el-form-item label="Choose Category" label-width="150px">
          <el-cascader
            clearable
            :props="props"
            @change="handleNode"
          />
        </el-form-item>
        <el-form-item>
          <el-tag
            v-for="tag in dynamicTags"
            :key="tag.id"
            type="success"
            closable
            :disable-transitions="true"
            @close="handleClose(tag)"
          >
            {{ tag.label }}
          </el-tag>
        </el-form-item>
        <el-form-item prop="image">
          <el-upload
            ref="uploadRef"
            class="upload-box"
            drag
            action="http://api.leyou.com/dev-api/upload/image"
            accept="image/png,image/gif,image/jpg,image/jpeg"
            :limit="limitNum"
            :before-upload="handleBeforeUpload"
            :on-remove="handleRemove"
            :on-success="handleAvatarSuccess"
            multiple
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text"><em>Click or drag the image here to upload</em><br><em>Only upload jpg / png files, and no more than 2MB</em></div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">Cancel</el-button>
        <el-button type="primary" :disabled="isdisable" @click="confirmBrand">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { getBrands, addBrand, updateBrand, deleteBrand, getCategories, getCyByBid, getCategory } from '@/api/goods'
import { deepClone } from '@/utils'

const defaultBrand = {
  brandId: '',
  name: '',
  image: '',
  heat: '0'
}

export default {
  name: 'Brand',

  data() {
    return {
      pageSize: [5, 10, 20, 100],
      isdisable: false,
      limitNum: 1,
      brand: Object.assign({}, defaultBrand),
      list: null,
      listLoading: true,
      downloadLoading: false,
      dialogVisible: false,
      dialogType: 'new',
      current: 1,
      size: 10,
      total: 0,
      text: null,
      rules: {
        name: [
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ]
      },
      // for category tag
      ids: [],
      tagContext: '',
      categoryList: [],
      node: null,
      dynamicTags: [],
      inputVisible: false,
      inputValue: '',
      props: {
        lazy: true,
        lazyLoad(node, resolve) {
          const { level } = node
          let whichLevel = 0
          if (level > 0) {
            whichLevel = node.value
          }
          getCategories(whichLevel).then((resp) => {
            const { data } = resp
            setTimeout(() => {
              const arr = []
              for (let index = 0; index < data.length; index++) {
                const item = {
                  value: data[index].id,
                  label: data[index].label,
                  leaf: !data[index].isParent
                }
                arr.push(item)
              }
              const nodes = arr
              // 通过调用resolve将子节点数据返回，通知组件数据加载完成
              resolve(nodes)
            }, 1000)
          })
        }
      }
    }
  },
  created() {
    this.getBrands()
  },
  methods: {
    async getBrands() {
      this.listLoading = true
      const cond = {
        idOrTitle: this.text
      }
      const pageParam = {
        size: this.size,
        current: this.current,
        cond: JSON.stringify(cond)
      }
      const { data } = await getBrands(pageParam)
      this.list = data.list
      this.total = data.totalCount
      this.listLoading = false
    },
    addBrand() {
      this.brand = Object.assign({}, defaultBrand)
      this.dialogType = 'new'
      this.dialogVisible = true
      this.dynamicTags = []
    },
    deleteBrand({ $index, row }) {
      this.$confirm('确定要删除该品牌吗? 如果删除该品牌，则该品牌下所有商品都将被删除!', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await deleteBrand(row.brandId)
          this.getBrands()
          this.$message({
            type: 'success',
            message: 'Delete succed!'
          })
        })
        .catch(err => { console.error(err) })
    },
    updateBrand(scope) {
      this.ids = []
      this.dynamicTags = []
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.brand = deepClone(scope.row)
      getCyByBid(this.brand.brandId).then(({ data }) => {
        if (data != null) {
          for (let index = 0; index < data.length; index++) {
            const item = {
              id: data[index].id,
              label: data[index].label
            }
            this.ids.push(item.id)
            this.dynamicTags.push(item)
          }
        }
      })
    },
    async confirmBrand() {
      let isSucced = false
      if (this.ids.length > 0) {
        this.isdisable = true
        const isEdit = this.dialogType === 'edit'
        Object.assign(this.brand, { ids: this.ids })
        if (isEdit) {
          await updateBrand(this.brand).then(() => {
            isSucced = true
            for (let index = 0; index < this.list.length; index++) {
              if (this.list[index].brandId === this.brand.brandId) {
                this.list.splice(index, 1, Object.assign({}, this.brand))
                break
              }
            }
          }).catch(() => {
            this.isdisable = false
          })
        } else {
          await addBrand(this.brand).then((resp) => {
            this.brand.brandId = resp.data
            isSucced = true
          }).catch(() => {
            this.isdisable = false
          })
          this.getBrands()
        }
        const { brandId, name, heat } = this.brand
        this.dialogVisible = false
        this.clearCascader = false
        this.ids = []
        if (isSucced) {
          this.$notify({
            title: 'Success',
            dangerouslyUseHTMLString: true,
            message: `
                <div>Brand Id: <i class="i-style">${brandId}</i></div>
                <div>Brand Name: <i class="i-style">${name}</i></div>
                <div>Brand Heat: <i class="i-style">${heat}</i></div>
              `,
            type: 'success'
          })
        }
      } else {
        this.$notify.warning({
          title: '警告',
          message: '品牌中至少存在一个类目！'
        })
      }
    },
    // 上传文件之前的钩子
    handleBeforeUpload(file) {
      if (!(file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
        this.$notify.warning({
          title: '警告',
          message: '请上传格式为image/png, image/gif, image/jpg, image/jpeg的图片'
        })
      }
      const size = file.size / 1024 / 1024 / 2
      if (size > 2) {
        this.$notify.warning({
          title: '警告',
          message: '图片大小必须小于2M'
        })
      }
    },
    // 文件列表移除文件时的钩子
    handleRemove(file, fileList) {
      this.$refs.uploadRef.clearFiles()
    },
    handleAvatarSuccess(response) {
      this.brand.image = response.data
    },
    handleDialogClose() {
      this.$refs.uploadRef.clearFiles()
      this.isdisable = false
    },
    handleSizeChange(val) {
      this.size = val
      this.getBrands()
    },
    handleCurrentChange(val) {
      this.current = val
      this.getBrands()
    },
    // for category tag
    handleClose(tag) {
      // find the id which be delete
      for (let index = 0; index < this.ids.length; index++) {
        if (this.ids[index] === tag.id) {
          this.ids.splice(this.ids.indexOf(tag.id), 1)
        }
      }
      // page delete
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    },
    handleNode(val) {
      const cId = val[val.length - 1]
      this.ids.push(cId)
      getCategory(cId).then(({ data }) => {
        const item = {
          id: data.id,
          label: data.label
        }
        this.dynamicTags.push(item)
      }).catch(() => {
      })
    }
  }
}
</script>

<style lang="scss">
  .dr {
    width: 34%;
    min-width: 500px;
  }
  .upload-box {
    margin-bottom: 20px;
  }
  .origin-image {
    margin-left: 60px;
  }
  .pagination {
    margin-top: 40px;
    margin-left: 24%;
  }
  .heat-style {
    font-size: 14px;
    color: #ff4700;
    font-weight: 700;
    background-color: rgba(255,50,2,.3);
    border: 1px deeppink solid;
  }
  .i-style {
    font-weight: 600;
    font-size: 14px;
    color: #002742;
  }
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
