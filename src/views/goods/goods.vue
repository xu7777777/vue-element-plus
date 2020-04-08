<template>
  <div class="app-container">
    <div class="help-bar">
      <el-select v-model="saleable" clearable placeholder="状态" value="" class="select-op" @change="getGoods">
        <el-option
          v-for="item in staOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input
        v-model="idOrTitle"
        placeholder="The goods's id or title"
        style="width:240px;"
        prefix-icon="el-icon-document"
      />
      <el-input
        v-model="brandName"
        placeholder="Brand's name for search"
        style="width:240px;"
        prefix-icon="el-icon-document"
      />
      <el-input
        v-model="categoryName"
        placeholder="Category name for search"
        style="width:240px;"
        prefix-icon="el-icon-document"
      />
      <el-button
        :loading="downloadLoading"
        style="margin-bottom:20px;"
        type="primary"
        icon="el-icon-search"
        @click="getGoods"
      >
        Search
      </el-button>
      <el-button type="primary">New Goods</el-button>
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
            {{ scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column label="商品名称" width="265" align="center">
          <template slot-scope="scope">
            <span style="font-weight: 800;">{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="85" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.saleable===1">上架</el-tag>
            <el-tag v-else class="heat-style">下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="品牌名称" width="185" align="center">
          <template slot-scope="scope">
            <span style="font-weight: 800;">{{ scope.row.brandName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类别" width="125" align="center">
          <template slot-scope="scope">
            <span style="font-weight: 800;">{{ scope.row.categoryName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="heat" sortable label="热度" width="135" align="center">
          <template slot-scope="scope">
            <el-tag class="heat-style">{{ scope.row.heat }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="卖点" width="685" align="center">
          <template slot-scope="scope">
            <span style="font-weight: 800;">{{ scope.row.subTitle }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="Operations" width="340" fixed="right">
          <template slot-scope="scope">
            <el-tooltip content="详情" placement="top">
              <el-button
                type="primary"
                icon="el-icon-info"
                circle
              />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button
                type="warning"
                icon="el-icon-edit"
                circle
                @click="updateBrand(scope)"
              />
            </el-tooltip>
            <el-tooltip content="上架" placement="top">
              <el-button
                type="success"
                icon="el-icon-upload2"
                circle
              />
            </el-tooltip>
            <el-tooltip content="下架" placement="top">
              <el-button
                type="danger"
                icon="el-icon-download"
                circle
                @click="deleteBrand(scope)"
              />
            </el-tooltip>
            <el-tooltip content="添加产品" placement="top">
              <el-button
                type="info"
                icon="el-icon-circle-plus"
                circle
                @click="addProducts(scope)"
              />
            </el-tooltip>
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
      slot="title"
      :visible.sync="dialogVisible"
      :title="dialogType"
      custom-class="dr"
      @close="handleDialogClose"
    >
      <div v-if="isAddInfo">
        <el-form ref="proForm" style="min-width: 840px;padding-left: 60px;" :model="proForm" :rules="proFromRule">
          <el-form-item label-width="100px" label="产品名称" style="margin:20px 0 0 10px;" prop="title">
            <el-input
              v-model="proForm.title"
              type="textarea"
              placeholder="请输入内容"
              clearable
              style="width: 230px;"
              :autosize="{ minRows: 1}"
            />
          </el-form-item>
          <el-form-item
            v-for="item in specParam"
            :key="item.id"
            label-width="100px"
            :label="item.name"
            style="margin:20px 0 0 10px;"
          >
            <el-input v-if="item.paramNumeric" v-model.trim="item.value" placeholder="请输入内容" clearable style="width: 230px;">
              <template slot="append">{{ item.unit }}</template>
            </el-input>
            <el-input
              v-else
              v-model.trim="item.value"
              type="textarea"
              placeholder="请输入内容"
              clearable
              style="width: 230px;"
              :autosize="{ minRows: 1}"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="售价"
            style="margin:20px 0 0 10px;"
            prop="price"
          >
            <el-input v-model.trim="proForm.price" placeholder="请输入内容" clearable style="width: 230px;">
              <template slot="append">¥</template>
            </el-input>
          </el-form-item>
          <el-form-item label="上传图片" label-width="100px" style="margin:20px 0 0 10px;">
            <el-upload
              ref="uploadRed2Add"
              action="http://api.leyou.com/dev-api/upload/image"
              list-type="picture-card"
              :file-list="uploadImages"
              :on-preview="handlePictureCardPreview2Add"
              :on-remove="handleAddImgRemove"
              :on-success="handleImgUploadSuccess2Add"
            >
              <i class="el-icon-plus" />
            </el-upload>
            <el-dialog :visible.sync="innerdialogVisible2Add" append-to-body="">
              <img width="100%" :src="dialogImageUrl" alt="">
            </el-dialog>
          </el-form-item>
          <el-button plain style="margin-left: 265px;" @click="addPro2Goods">添加</el-button>
          <div class="tip" style="position: absolute; width: 300px; margin-left: 400px; top: 80px;">
            <p style="color: black; font-size: 30px; font-weight: 600;">小提醒</p>
            <span>添加的产品将会成为商品的延展，您可以点击商品详情来查看该商品已有的产品。同时如果您不上传图片，那么在前台页面中能够展示该产品。</span>
          </div>
        </el-form>
        <el-divider><i class="el-icon-mobile-phone" /></el-divider>
        <el-form style="min-width: 840px;padding-left: 20px;" :inline="true" label-position="top">
          <el-form-item v-for="product in productCards" :key="product.id" label-width="80px" style="margin-left: 15px">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>{{ product.title }}</span>
                <el-button style="float: right; padding: 3px 0; margin-top: 10px;" type="text" @click="delProduct(product)">删除</el-button>
              </div>
              <el-form ref="ruleForm" :inline="true" label-position="top" :model="product" :rules="proFromRule">
                <el-form-item label-width="100px" label="产品图片" style="margin:20px 0 0 10px;">
                  <div @click="getPid(product.id)">
                    <el-upload
                      ref="uploadRef2Mod"
                      action="http://api.leyou.com/dev-api/upload/image"
                      list-type="picture-card"
                      :file-list="product.images"
                      :on-preview="handlePictureCardPreview2Mod"
                      :on-progress="handelProgress"
                      :on-remove="handleRemove2Modify"
                      :on-success="handleImgUploadSuccess2Mod"
                    >
                      <i class="el-icon-plus" />
                    </el-upload>
                    <el-dialog :visible.sync="innerdialogVisible2Mod" append-to-body="">
                      <img width="100%" :src="dialogImageUrl" alt="">
                    </el-dialog>
                  </div>
                </el-form-item>
                <el-form-item
                  label-width="90px"
                  label="产品名称"
                  style="margin:10px 0 0 30px;"
                  prop="title"
                >
                  <el-input v-model="product.title" placeholder="请输入产品名称" type="textarea" :autosize="{ minRows: 1}" clearable style="width: 190px;" />
                </el-form-item>
                <el-form-item
                  v-for="item in product.ownSpec"
                  :key="item.id"
                  label-width="90px"
                  :label="item.key"
                  style="margin:10px 0 0 30px;"
                  prop="proInput"
                >
                  <el-input v-model.trim="item.value" placeholder="请输入内容" clearable style="width: 190px;">
                    <template v-if="item.paramNumeric" slot="append">{{ item.unit }}</template>
                  </el-input>
                </el-form-item>
                <el-form-item
                  label-width="90px"
                  label="售价"
                  style="margin:10px 0 0 30px;"
                  prop="price"
                >
                  <el-input v-model.trim="product.price" placeholder="请输入内容" clearable style="width: 190px;">
                    <template slot="append">¥</template>
                  </el-input>
                </el-form-item>
                <el-form-item
                  label-width="90px"
                  label="状态"
                  style="margin:10px 0 0 30px;"
                  prop="input"
                >
                  <el-select v-model="product.enable" value="" style="width: 110px;">
                    <el-option
                      v-for="item in staOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.label"
                    />
                  </el-select>
                </el-form-item>
                <el-button plain style="margin-left: 265px;" @click="modProduct(product)">修改</el-button>
              </el-form>
            </el-card>
          </el-form-item>
        </el-form>
      </div>
      <div v-else>
        <el-steps :active="active" align-center style="margin-top: -10px; margin-bottom: 10px; box-shadow:0 1px 2px -1px black; padding: 20px 10px 0;">
          <el-step title="基本信息" :status="stepStatus[0]" />
          <el-step title="商品描述" :status="stepStatus[1]" />
          <el-step title="规格参数" :status="stepStatus[2]" />
        </el-steps>
        <el-form v-show="Valid[0]" ref="spuContent" :model="spuContent" :inline="true" label-width="80px" style="min-width: 840px;padding-left: 60px;">
          <el-form-item label="商品分类" style="margin: 30px;" prop="category">
            <el-cascader
              placeholder="请选择分类"
              :props="props"
              :show-all-levels="false"
              @change="handleNode"
            />
          </el-form-item>
          <el-form-item label="商品品牌" style="margin: 30px;" prop="brand">
            <el-select v-model="spuContent.brandId" value="" placeholder="请选择品牌">
              <el-option
                v-for="selBrand in brands"
                :key="selBrand.brandId"
                :label="selBrand.name"
                :value="selBrand.brandId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="商品标题" style="margin:0 30px 15px;" prop="goodsTitle">
            <el-input
              v-model="spuContent.title"
              placeholder="请输入内容"
              clearable
              style="width: 530px;"
            />
          </el-form-item>
          <el-form-item label="商品卖点" style="margin:15px 30px;">
            <el-input
              v-model="spuContent.subTitle"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="请输入卖点"
              style="width: 530px;"
            />
          </el-form-item>
          <el-form-item label="包装清单" style="margin:15px 30px;">
            <el-input
              v-model="spuContent.packingList"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="请输入包装清单"
              style="width: 530px;"
            />
          </el-form-item>
          <el-form-item label="售后服务" style="margin:15px 30px;">
            <el-input
              v-model="spuContent.afterService"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="请输入售后服务"
              style="width: 530px;"
            />
          </el-form-item>
        </el-form>
        <el-upload
          class="ivu-upload"
          :show-upload-list="false"
          :on-success="handleSuccess"
          :format="['jpg','jpeg','png','gif']"
          :max-size="2048000"
          multiple
          action="http://api.leyou.com/dev-api/upload/image"
        >
          <Button class="ivu-btn" />
        </el-upload>
        <quill-editor
          v-show="Valid[1]"
          ref="myQuillEditor"
          v-model="spuContent.description"
          :options="editorOption"
          @focus="onEditorFocus($event)"
          @blur="onEditorBlur($event)"
          @change="onEditorChange($event)"
        />
        <el-form v-show="Valid[2]" label-width="80px" :rules="rulesForm" :inline="true">
          <el-form-item
            v-for="item in genParam"
            :key="item.id"
            label-width="180px"
            :label="item.name"
            style="margin:30px 10px 0 10px;"
          >
            <el-input v-model.trim="item.value" placeholder="请输入内容" clearable style="width: 180px;">
              <template v-if="item.paramNumeric" slot="append">{{ item.unit }}</template>
            </el-input>
          </el-form-item>
        </el-form>
        <div style="float: bottom; margin-left: 24%; margin-top: 22px;">
          <el-button style="margin-right: 40px;" :disabled="preDisable" @click="preStep">上一步</el-button>
          <el-button v-if="active<2" style="margin-top: 12px; margin-left: 180px;" @click="nextStep">下一步</el-button>
          <el-button v-else style="margin-top: 12px; margin-left: 180px;" @click="finishedStep">提交商品</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { addPro2Goods, getGoods, addBrand, updateBrand, deleteBrand, getCategories, getCyByBid, getCategory, getBrandsByCId, getParams, getProducts, modPro2Goods, delProduct } from '@/api/goods'
import { deepClone } from '@/utils'
import { quillEditor } from 'vue-quill-editor' // 调用富文本编辑器
import 'quill/dist/quill.snow.css' // 富文本编辑器外部引用样式  三种样式三选一引入即可
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.bubble.css'
// 富文本基于quill
// import * as Quill from 'quill';

const defaultBrand = {
  brandId: '',
  name: '',
  image: '',
  heat: '0'
}

// 工具栏配置
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],

  [{ 'header': 1 }, { 'header': 2 }], // custom button values
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'script': 'sub' }, { 'script': 'super' }], // superscript/subscript
  [{ 'indent': '-1' }, { 'indent': '+1' }], // outdent/indent
  [{ 'direction': 'rtl' }], // text direction

  [{ 'size': ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  [{ 'color': [] }, { 'background': [] }], // dropdown with defaults from theme
  [{ 'font': [] }],
  [{ 'align': [] }],
  ['link', 'image', 'video'],
  ['clean'] // remove formatting button
]
export default {
  name: 'Brand',

  components: {
    quillEditor
  },
  data() {
    // 验证售价格式
    const validatePrice = (rule, value, callback) => {
      const reg = /^[0-9]+\.[0-9]{2}$/
      if (value === '') {
        this.canMod = false
        callback(new Error('请输入售价'))
      } else {
        if (!reg.test(value.toString())) {
          this.canMod = false
          callback(new Error('请确认售价格式如 10.00'))
        }
        this.canMod = true
        callback()
      }
    }
    return {
      // 弹窗
      dialogImageUrl: '',
      innerdialogVisible2Mod: false,
      innerdialogVisible2Add: false,
      multipleSelection: [],
      // 富文本编辑器对象
      editor: null,
      //  富文本编辑器配置
      editorOption: {
        modules: {
          toolbar: {
            container: toolbarOptions, // 工具栏
            handlers: {
              'image': function(value) {
                if (value) {
                  // 调用iview图片上传
                  document.querySelector('.ivu-upload .ivu-btn').click()
                } else {
                  this.quill.format('image', false)
                }
              }
            }
          }
        }
      },
      idOrTitle: '',
      brandName: '',
      categoryName: '',
      productCards: [],
      // for addInfo
      goodsId: '',
      isAddInfo: false,
      imageUrl: '',
      uploadImages: [], // 暂存上传后的图片链接
      // for form
      Valid: [true, false, false],
      stepStatus: ['wait', 'wait', 'wait'],
      preDisable: true,
      // for form 1
      brands: [],
      inputBrandTitle: '',
      spuContent: {
        cid3: '',
        brandId: '',
        title: '',
        subTitle: '',
        packingList: '',
        afterService: '',
        description: '',
        genericSpec: {}
      },
      specialContent: [],
      specTags: [],
      inputVal: '',
      genParam: [],
      specParam: [],
      productList: [],
      canMod: true,
      tmpPid: '',
      proForm: {
        title: '',
        price: '',
        images: [],
        ownSpec: [],
        goodsId: ''
      },
      rulesForm: {
        category: [
          { required: true, trigger: 'blur' }
        ],
        brand: [
          { required: true, trigger: 'blur' }
        ],
        goodsTitle: [
          { required: true, message: '请输入商品标题', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ]
      },
      proFromRule: {
        title: [
          { required: true, message: '请输入产品标题！', trigger: 'blur' }
        ],
        price: [
          { validator: validatePrice, required: true, trigger: 'blur' }
        ]
      },
      // for step
      active: 0,
      // for select
      saleable: '',
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
      dialogType: 'New Goods',
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
    this.getGoods()
  },
  mounted() {
    this.editor = this.$refs.myQuillEditor.quill
  },
  beforeDestroy() {
    this.editor = null
    delete this.editor
  },
  methods: {
    // tool for change the decimal point
    handleAddPoint(price) {
      const tmp = price.toString().split('')
      let str = ''
      if (tmp[tmp.length - 3] !== '.') {
        for (let index = 0; index < tmp.length - 2; index++) {
          str += tmp[index]
        }
        str += '.' + tmp[tmp.length - 2] + tmp[tmp.length - 1]
      }
      return str
    },
    // tool for change the decimal point
    handleDelPoint(price) {
      const tmp = price.toString().split('')
      let str = ''
      if (tmp[tmp.length - 3] === '.') {
        for (let index = 0; index < tmp.length; index++) {
          if (tmp[index] !== '.') {
            str += tmp[index]
          }
        }
      }
      return str
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // add tag
    addTag(item, id, value, unit) {
      if (value === '' || value === undefined) {
        return
      }
      this.specialContent.push({ id: id, value: value })
      item.content.push({ specId: id, name: value + ' ' + unit })
    },
    handleSuccess(res) {
      // 获取富文本组件实例
      const quill = this.$refs.myQuillEditor.quill
      // 如果上传成功
      if (res) {
        // 获取光标所在位置
        const length = quill.getSelection().index
        // 插入图片，res为服务器返回的图片链接地址
        quill.insertEmbed(length, 'image', res.data)
        // 调整光标到最后
        quill.setSelection(length + 1)
      } else {
        this.$notify.error('图片插入失败')
      }
    },
    // 富文本编辑器 点击插入图片或者视频
    insertImgClick(e) {
      if (e.target.className.indexOf('icon-pic') !== -1) {
        document.getElementById('insert_image').click()
      } else if (e.target.className.indexOf('icon-video') !== -1) {
        document.getElementById('insert_video').click()
      }
    },
    // 富文本编辑器 点击插入图片或者视频上传并预览
    fileInsert(e) {
      var oFile = e.target.files[0]
      if (typeof (oFile) === 'undefined') {
        return
      }
      // 文件扩展名
      const sExtensionName = oFile.name.substring(oFile.name.lastIndexOf('.') + 1).toLowerCase()
      // 上传文件类型
      let sfileType = ''
      if (e.target.id === 'insert_image') {
        sfileType = 'image'
        if (sExtensionName !== 'png' && sExtensionName !== 'jpg' && sExtensionName !== 'jpeg') {
          alert('不支持该类型图片')
          return
        }
      }
      if (e.target.id === 'insert_video') {
        sfileType = 'video'
        if (sExtensionName !== 'mp4' && sExtensionName !== 'avi' && sExtensionName !== 'mov') {
          alert('不支持该类型视频')
          return
        }
        // 100MB
        const maxSize = 100 * 1024 * 1024
        if (oFile.size > maxSize) {
          alert('上传视频大小不能超过100MB')
          return
        }
      }
      var reader = new FileReader()
      reader.readAsDataURL(oFile)
      reader.onloadend = () => {
        const formData = new FormData() // 通过formdata上传
        formData.append('file', oFile)
        let sUrl = ''
        if (sfileType === 'image') {
          sUrl = 'Pic'
        }
        if (sfileType === 'video') {
          sUrl = 'Vie'
        }
        var url = this.api_config + '/dealerIndex/upload' + sUrl + '.htm'
        this.axios.post(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }).then((res) => {
          this.editor.insertEmbed(this.editor.selection.savedRange.index, sfileType, res.data.data) // 这个方法用来手动插入dom到编辑器里
          this.editor.setSelection(this.editor.selection.savedRange.index + 1) // 这个方法可以获取光标位置
        }).catch((response) => {
          console.log('失败', response)
        })
      }
    },
    // 准备富文本编辑器
    onEditorReady(editor) {},
    // 富文本编辑器 失去焦点事件
    onEditorBlur(editor) {
      // console.log(editor)
      // console.log(this.content)
    },
    // 富文本编辑器 获得焦点事件
    onEditorFocus(editor) {},
    // 富文本编辑器 内容改变事件
    onEditorChange(editor) {},
    async getGoods() {
      this.listLoading = true
      const cond = {
        saleable: this.saleable,
        idOrTitle: this.idOrTitle,
        brandName: this.brandName,
        categoryName: this.categoryName
      }
      const pageParam = {
        size: this.size,
        current: this.current,
        cond: JSON.stringify(cond)
      }
      const { data } = await getGoods(pageParam)
      this.list = data.list
      this.total = data.totalCount
      this.listLoading = false
    },
    addBrand() {
      this.brand = Object.assign({}, defaultBrand)
      this.dialogType = 'New Goods'
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
      this.dialogType = 'Edit Goods'
      this.dialogVisible = true
      this.brand = deepClone(scope.row)
      getCyByBid(this.brand.id).then(({ data }) => {
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
    handleAddImgRemove(file, fileList) {
      this.uploadImages = fileList
    },
    // handleAvatarSuccess(response) {
    //   this.brand.image = response.data
    // },
    handleDialogClose() {
      if (this.isAddInfo) {
        this.$refs.uploadRed2Add.clearFiles()
      }
      this.specParam = []
      this.proForm.images = ''
      this.uploadImages = []
      this.proForm.ownSpec = []
      this.proForm.title = ''
      this.proForm.price = ''
      this.proForm.goodsId = ''
      this.specParam = []
      this.isAddInfo = false
      this.isdisable = false
      this.spuContent.brandId = ''
      this.spuContent.cid3 = ''
      this.spuContent.afterService = ''
      this.spuContent.title = ''
      this.spuContent.packingList = ''
      this.spuContent.subTitle = ''
      this.spuContent.description = ''
    },
    handleSizeChange(val) {
      this.size = val
      this.getGoods()
    },
    handleCurrentChange(val) {
      this.current = val
      this.getGoods()
    },
    // for special param tag
    handleClose(tag, content) {
      content.splice(content.indexOf(tag), 1)
    },
    async handleNode(val) {
      const cId = val[val.length - 1]
      this.spuContent.cid3 = cId
      // add brand
      await getBrandsByCId(cId).then(({ data }) => {
        this.brands = data
        this.spuContent.brandId = ''
      })
      // get generic param
      await getParams(cId, true).then(({ data }) => {
        this.genParam = data
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
      // let isError = false
      // let errorMessage = '  '
      // if (this.active === 0) {
      //   if (this.ruleForm1.cid3 === '') {
      //     errorMessage += '  请选择分类!'
      //     isError = true
      //   }
      //   if (this.ruleForm1.brandId === '') {
      //     errorMessage += '  请选择品牌!  '
      //     isError = true
      //   }
      //   if (this.ruleForm1.title === '') {
      //     errorMessage += '  请填写商品标题!  '
      //     isError = true
      //   }
      //   if (isError) {
      //     this.$notify.warning({
      //       title: '提示',
      //       message: errorMessage
      //     })
      //     return
      //   }
      // }
      this.Valid[this.active] = false
      this.stepStatus[this.active] = 'success'
      if (++this.active > 3) {
        this.active = 2
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
    },
    // opertions
    async addProducts(scope) {
      this.goodsId = scope.row.id
      this.isAddInfo = true
      this.dialogType = 'Add Informations'
      this.dialogVisible = true
      // get special param
      await getParams(scope.row.cid, false).then(({ data }) => {
        for (let index = 0; index < data.length; index++) {
          data[index] = Object.assign({}, data[index], { content: [] })
          this.specParam.push(data[index])
        }
      })
      this.getProduct()
    },
    async getProduct() {
      this.productCards = []
      await getProducts(this.goodsId).then(({ data }) => {
        data.forEach(item => {
          for (let j = 0; j < item.ownSpec.length; j++) {
            for (let i = 0; i < this.specParam.length; i++) {
              if (item.ownSpec[j].id === this.specParam[i].id) {
                item.ownSpec[j] = Object.assign({}, item.ownSpec[j], { key: this.specParam[i].name, paramNumeric: this.specParam[i].paramNumeric, unit: this.specParam[i].unit })
                break
              }
            }
          }
          item.price = this.handleAddPoint(item.price)
          this.productCards.push(item)
        })
      })
        .catch(() => {
          console.log('error!')
        })
    },
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    handlePictureCardPreview2Add(file) {
      this.dialogImageUrl = file.url
      this.innerdialogVisible2Add = true
    },
    handlePictureCardPreview2Mod(file) {
      this.dialogImageUrl = file.url
      this.innerdialogVisible2Mod = true
    },
    handleImgUploadSuccess2Add(response) {
      const obj = {
        url: response.data
      }
      this.uploadImages.push(obj)
    },
    getPid(pid) {
      this.tmpPid = pid
    },
    beforeUpload(pid) {
    },
    handleImgUploadSuccess2Mod(response) {
      const obj = {
        url: response.data,
        status: 'success'
      }
      for (let index = 0; index < this.productCards.length; index++) {
        if (this.productCards[index].id === this.tmpPid) {
          this.productCards[index].images.push(obj)
        }
      }
    },
    handelProgress(response, file, fileList) {
      //
    },
    handleRemove2Modify(file, fileList) {
      console.log(fileList)
    },
    // 添加产品
    async addPro2Goods() {
      await this.$refs.proForm.validate((valid) => {
        if (valid) {
          this.proForm.goodsId = this.goodsId
          let images = ''
          const ownSpec = []
          this.specParam.forEach((data) => {
            const tmp = {
              id: data.id,
              value: data.value ? data.value : ''
            }
            ownSpec.push(tmp)
          })
          if (this.uploadImages.length > 0) {
            for (let index = 0; index < this.uploadImages.length - 1; index++) {
              images += this.uploadImages[index].url + ';;'
            }
            images += this.uploadImages[this.uploadImages.length - 1].url
          }
          // 注意上传文件结束之后应当清空文件列表（待完成）
          this.proForm.price = this.handleDelPoint(this.proForm.price)
          this.proForm.ownSpec = ownSpec
          this.proForm.images += images
          addPro2Goods(this.proForm).then(() => {
            this.$refs.uploadRed2Add.clearFiles()
            this.proForm.images = ''
            this.uploadImages = []
            this.proForm.ownSpec = []
            this.proForm.title = ''
            this.proForm.price = ''
            this.proForm.goodsId = ''
            this.getProduct()
            this.specParam.forEach((item) => {
              item.value = ''
            })
            this.$notify.success({
              title: '成功',
              message: '添加产品成功，您可以下拉查看！'
            })
          })
            .catch(() => {
              this.$notify.warning({
                title: '失败',
                message: '添加产品失败！'
              })
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // functions for product
    async modProduct(product) {
      if (this.canMod && product.title !== '') {
        let images = ''
        if (product.images.length > 0) {
          for (let index = 0; index < product.images.length - 1; index++) {
            images += product.images[index].url + ';;'
          }
          images += product.images[product.images.length - 1].url
        }
        const productForm = {
          proId: product.id,
          title: product.title,
          images: images,
          price: this.handleDelPoint(product.price),
          ownSpec: product.ownSpec,
          enable: product.enable === '上架' ? 1 : -1
        }
        await modPro2Goods(productForm).then(() => {
          this.$notify.success({
            title: '成功',
            message: '修改产品成功！'
          })
        })
          .catch(() => {
            this.$notify.warning({
              title: '失败',
              message: '修改产品失败！'
            })
          })
      } else {
        this.$notify.warning({
          title: '失败',
          message: '请确保输入格式正确！'
        })
      }
    },
    async delProduct(product) {
      this.$confirm('确定要删除该产品吗?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await delProduct(product.id)
          this.getProduct()
          this.$message({
            type: 'success',
            message: 'Delete succed!'
          })
        })
        .catch(err => { console.error(err) })
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

  .ql-editor {
    min-height: 420px;
  }

  .ivu-upload {
    display: none;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 78px;
    height: 78px;
    line-height: 78px;
    text-align: center;
  }
  .avatar {
    width: 78px;
    height: 78px;
    display: block;
  }
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both;
  }

  .box-card {
    width: 380px;
  }
</style>
