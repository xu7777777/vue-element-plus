<template>
  <div class="app-container">
    <div class="help-bar">
      <el-select v-model="staVal" clearable placeholder="Status" value="" class="select-op">
        <el-option
          v-for="item in staOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input
        v-model="text"
        placeholder="The goods's id or title"
        style="width:240px;"
        prefix-icon="el-icon-document"
        @keyup.native="getBrands"
      />
      <el-input
        v-model="text"
        placeholder="Brand's name for search"
        style="width:240px;"
        prefix-icon="el-icon-document"
        @keyup.native="getBrands"
      />
      <el-input
        v-model="text"
        placeholder="Category name for search"
        style="width:240px;"
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
      <el-button type="primary" @click="addBrand">New Goods</el-button>
    </div>
    <div class="container-box">
      <el-table
        v-loading="listLoading"
        :data="list"
        :default-sort="{prop: 'heat', order: 'descending'}"
        element-loading-text="拼命加载中"
        border
        fit
        highlight-current-row
      >
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
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogType==='edit'?'Edit Brand':'New Brand'"
      custom-class="dr"
      @close="handleDialogClose"
    >
      <el-steps :active="active" align-center style="margin-top: -10px; margin-bottom: 10px; box-shadow:0 1px 2px -1px black; padding: 20px 10px 0;">
        <el-step title="基本信息" :status="stepStatus[0]" />
        <el-step title="商品描述" :status="stepStatus[1]" />
        <el-step title="规格参数" :status="stepStatus[2]" />
        <el-step title="提交详情" :status="stepStatus[3]" />
      </el-steps>
      <el-form v-show="Valid[0]" :model="ruleForm1" :inline="true" :rules="rules1" label-width="80px" style="min-width: 840px;padding-left: 60px;">
        <el-form-item label="商品分类" style="margin: 30px;" prop="category">
          <el-cascader
            placeholder="请选择分类"
            :props="props"
            :show-all-levels="false"
            @change="handleNode"
          />
        </el-form-item>
        <el-form-item label="商品品牌" style="margin: 30px;" prop="brand">
          <el-select v-model="ruleForm1.brandId" value="" placeholder="请选择品牌">
            <el-option
              v-for="selBrand in brands"
              :key="selBrand.brandId"
              :label="selBrand.name"
              :value="selBrand.brandId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品标题" style="margin:0 30px 15px;" prop="title">
          <el-input
            v-model="ruleForm1.title"
            placeholder="请输入内容"
            clearable
            style="width: 530px;"
          />
        </el-form-item>
        <el-form-item label="商品卖点" style="margin:15px 30px;">
          <el-input
            v-model="ruleForm1.subTitle"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入卖点"
            style="width: 530px;"
          />
        </el-form-item>
        <el-form-item label="包装清单" style="margin:15px 30px;">
          <el-input
            v-model="ruleForm1.packingList"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入包装清单"
            style="width: 530px;"
          />
        </el-form-item>
        <el-form-item label="售后服务" style="margin:15px 30px;">
          <el-input
            v-model="ruleForm1.afterService"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入售后服务"
            style="width: 530px;"
          />
        </el-form-item>
      </el-form>
      <el-form v-show="Valid[1]" label-width="80px">
        <el-form-item label="id">
          <el-tag>2</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>2</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
      </el-form>
      <el-form v-show="Valid[2]" label-width="80px">
        <el-form-item label="id">
          <el-tag>3</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
      </el-form>
      <el-form v-show="Valid[3]" label-width="80px">
        <el-form-item label="id">
          <el-tag>4</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
        <el-form-item label="id">
          <el-tag>1</el-tag>
        </el-form-item>
      </el-form>
      <div style="float: bottom; margin-left: 24%;">
        <el-button style="margin-top: 12px; margin-right: 40px;" :disabled="preDisable" @click="preStep">上一步</el-button>
        <el-button v-if="active<3" style="margin-top: 12px; margin-left: 180px;" @click="nextStep">下一步</el-button>
        <el-button v-else style="margin-top: 12px; margin-left: 180px;" @click="finishedStep">提交商品</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { getBrands, addBrand, updateBrand, deleteBrand, getCategories, getCyByBid, getCategory, getBrandsByCId } from '@/api/goods'
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
      // for form
      Valid: [true, false, false, false],
      stepStatus: ['wait', 'wait', 'wait', 'wait'],
      preDisable: true,
      // for form 1
      brands: [],
      inputBrandTitle: '',
      ruleForm1: {
        cid3: '',
        brandId: '',
        title: '',
        subTitle: '',
        packingList: '',
        afterService: ''
      },
      rules1: {
        category: [
          { required: true, trigger: 'blur' }
        ],
        brand: [
          { required: true, trigger: 'blur' }
        ],
        title: [
          { required: true, message: '请输入商品标题', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ]
      },
      // for step
      active: 0,
      // for select
      staVal: '',
      staOptions: [{
        value: '-1',
        label: '下架'
      }, {
        value: '1',
        label: '上架'
      }],
      // basic
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
  mounted() {
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
        .catch(err => {
          console.error(err)
        })
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
      this.isdisable = false
      this.ruleForm1.brandId = ''
      this.ruleForm1.cid3 = ''
      this.ruleForm1.afterService = ''
      this.ruleForm1.title = ''
      this.ruleForm1.packingList = ''
      this.ruleForm1.subTitle = ''
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
    async handleNode(val) {
      const cId = val[val.length - 1]
      this.ruleForm1.cid3 = cId
      // add brand
      await getBrandsByCId(cId).then(({ data }) => {
        this.brands = data
        this.ruleForm1.brandId = ''
      })
      // build category tag
      getCategory(cId).then(({ data }) => {
        const item = {
          id: data.id,
          label: data.label
        }
        this.dynamicTags.push(item)
      }).catch(() => {
      })
    },
    // for step
    nextStep() {
      console.log(this.ruleForm1)
      let isError = false
      let errorMessage = '  '
      if (this.active === 0) {
        if (this.ruleForm1.cid3 === '') {
          errorMessage += '  请选择分类!'
          isError = true
        }
        if (this.ruleForm1.brandId === '') {
          errorMessage += '  请选择品牌!  '
          isError = true
        }
        if (this.ruleForm1.title === '') {
          errorMessage += '  请填写商品标题!  '
          isError = true
        }
        if (isError) {
          this.$notify.warning({
            title: '提示',
            message: errorMessage
          })
          return
        }
      }
      this.Valid[this.active] = false
      this.stepStatus[this.active] = 'success'
      if (++this.active > 4) {
        this.active = 3
      }
      this.Valid[this.active] = true
      this.preDisable = false
    },
    preStep() {
      this.Valid[this.active] = false
      this.stepStatus[this.active] = 'wait'
      if (--this.active <= 0) {
        this.active = 0
        this.preDisable = true
      }
      this.Valid[this.active] = true
      this.stepStatus[this.active] = 'wait'
    },
    finishedStep() {
      this.stepStatus[this.active] = 'success'
    }
  }
}
</script>

<style lang="scss">
  .dr {
    width: 54%;
    min-width: 880px;
    /*min-height: 740px;*/
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
    background-color: rgba(255, 50, 2, .3);
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

  .help-bar {
    min-width: 1400px;
  }

  .select-op {
    width: 120px;
    min-width: 120px;
  }

  .step-bar {
    width: 100%;
    min-width: 700px;
  }
</style>
