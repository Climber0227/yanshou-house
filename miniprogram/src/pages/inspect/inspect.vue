<template>
<scroll-view class="page" scroll-y style="padding-bottom:140px;">
  <!-- 检查类型 TAB -->
  <view class="seg-lg">
    <view v-for="t in types" :key="t.key"
      class="seg-item-lg" :class="{ active: activeType === t.key }"
      @click="switchType(t.key)">
      <text>{{ t.label }}</text>
    </view>
  </view>

  <!-- 观感 / 公区 visual 项 -->
  <view v-if="isVisual">
    <InspectItem v-for="(item, idx) in visualItems" :key="item.id"
      :item="item" :index="idx + 1" @addPhoto="onAddPhoto" />
  </view>

  <!-- 实测 -->
  <view v-if="activeType === 'measure'">
    <view v-for="item in measureItems" :key="item.id" class="m-card">
      <view class="m-hd">
        <text class="m-name">{{ item.name }}</text>
        <text class="m-desc">{{ item.desc }}</text>
      </view>
      <view v-if="item.perRoom" v-for="room in item.rooms" :key="room" class="m-room">
        <text class="mr-label">{{ roomLabel(room) }}</text>
        <view class="mr-row">
          <view class="mr-cell estimated">
            <text class="mr-lbl">推算值</text>
            <text class="mr-val">—</text>
          </view>
          <view class="mr-cell">
            <text class="mr-lbl">实测值 (mm)</text>
            <input class="mr-inp" type="digit" v-model="md[item.id+'_'+room]" placeholder="0" />
          </view>
        </view>
      </view>
      <view v-if="!item.perRoom && item.subItems" v-for="si in item.subItems" :key="si" class="m-single">
        <text class="mr-label">{{ si }}</text>
        <input class="mr-inp" type="digit" v-model="sd[item.id+'_'+si]" placeholder="实测值 mm" />
      </view>
    </view>
  </view>

  <!-- ===== 公区：全部 14 项逐项渲染 ===== -->
  <view v-if="activeType === 'public'">
    <view v-for="item in allPublicItems" :key="item.id" class="m-card">
      <!-- 纯视觉项用 check-hd 展示，不重复渲染 m-hd -->
      <view class="m-hd" v-if="item.measures || item.visualChecks">
        <view class="check-num">{{ item.seq }}</view>
        <view class="check-info">
          <text class="m-name">{{ item.name }}</text>
          <text class="m-desc" v-if="item.desc">{{ item.desc }}</text>
        </view>
      </view>

      <!-- 实测子项 -->
      <view v-if="item.measures" v-for="m in item.measures" :key="m.key" class="m-single">
        <text class="mr-label">{{ m.label }}</text>
        <view class="mr-row">
          <view class="mr-cell estimated">
            <text class="mr-lbl">推算值</text>
            <text class="mr-val">{{ estimatedValues[m.key] || '—' }}</text>
          </view>
          <view class="mr-cell">
            <text class="mr-lbl">实测值 (mm)</text>
            <input class="mr-inp" type="digit" v-model="pm[m.key]" placeholder="0" />
          </view>
        </view>
        <!-- 差值实时判定 -->
        <view v-if="pm[m.key] && estimatedValues[m.key]" class="diff-row">
          <text>差值：{{ Math.abs((pm[m.key]||0) - (estimatedValues[m.key]||0)) }}mm</text>
          <text :class="Math.abs((pm[m.key]||0) - (estimatedValues[m.key]||0)) > 5 ? 'diff-fail' : 'diff-pass'">
            {{ Math.abs((pm[m.key]||0) - (estimatedValues[m.key]||0)) > 5 ? '超差 ✗' : '合格 ✓' }}
          </text>
        </view>
      </view>

      <!-- 视觉检查子项（楼梯） -->
      <view v-if="item.visualChecks" v-for="vc in item.visualChecks" :key="vc.key" class="sub-check-row" @click="togglePubCheck(vc.key)">
        <text class="sub-check-label">{{ vc.label }}</text>
        <view class="check-toggle-inline" :class="{ pass: !pubCheckData[vc.key] }">
          <text>{{ pubCheckData[vc.key] ? '不合格' : '合格' }}</text>
        </view>
        <!-- 不合格展开 -->
        <view v-if="pubCheckData[vc.key]" style="width:100%;margin-top:6px;" @click.stop>
          <textarea class="textarea" v-model="pubCheckDesc[vc.key]" placeholder="问题描述" />
          <view class="photo-g">
            <view v-for="(p,pi) in (pubCheckPhotos[vc.key]||[])" :key="pi" class="photo-i">
              <image :src="p" mode="aspectFill" />
              <text class="photo-d" @click.stop="pubCheckPhotos[vc.key].splice(pi,1)">X</text>
            </view>
            <view v-if="(pubCheckPhotos[vc.key]||[]).length < 9" class="photo-a" @click.stop="addPubCheckPhoto(vc.key)">
              <text class="photo-a-icon">+</text>
              <text class="photo-a-t">拍照</text>
            </view>
          </view>
          <!-- 视频/语音 -->
          <view class="media-row">
            <view class="media-btn" @click.stop="recordPubCheckVideo(vc.key)">
              <text>{{ pubCheckVideo[vc.key] ? '已录视频' : '录视频（可选）' }}</text>
              <text v-if="pubCheckVideo[vc.key]" class="media-del" @click.stop="pubCheckVideo[vc.key] = ''">X</text>
            </view>
            <view class="media-btn" @click.stop="recordPubCheckVoice(vc.key)">
              <text>{{ pubRecording['pcv_' + vc.key] ? '录音中...点击停止' : (pubCheckVoice[vc.key] ? '已录音 ✓' : '语音备注（可选）') }}</text>
              <text v-if="pubCheckVoice[vc.key] && !pubRecording['pcv_' + vc.key]" class="media-del" @click.stop="pubCheckVoice[vc.key] = ''">X</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 纯视觉项（5-15）-- 与观感统一布局：名称左 + 按钮右 -->
      <template v-if="!item.measures && !item.visualChecks">
        <view class="check-hd" @click="togglePubVisual(item.id)">
          <view class="check-num">{{ item.seq }}</view>
          <view class="check-info">
            <text class="check-name">{{ item.name }}</text>
          </view>
          <view class="check-toggle-inline" :class="{ pass: !getPubVisual(item.id)._hasIssue }">
            <text>{{ getPubVisual(item.id)._hasIssue ? '不合格' : '合格' }}</text>
          </view>
        </view>
        <view v-if="getPubVisual(item.id)._hasIssue" style="margin-top:8px;">
          <view class="preset-r" v-if="item.presets">
            <view v-for="p in item.presets" :key="p"
              class="preset-item" :class="{ selected: getPubVisual(item.id)._desc === p }"
              @click="setPubVisualDesc(item.id, p)">
              <text>{{ p }}</text>
            </view>
          </view>
          <textarea class="textarea" v-model="getPubVisual(item.id)._desc" placeholder="补充问题描述" />
          <view class="photo-g">
            <view v-for="(p,pi) in (getPubVisual(item.id)._photos||[])" :key="pi" class="photo-i">
              <image :src="p" mode="aspectFill" />
              <text class="photo-d" @click="getPubVisual(item.id)._photos.splice(pi,1)">X</text>
            </view>
            <view v-if="(getPubVisual(item.id)._photos||[]).length < 9" class="photo-a" @click="addPubVisualPhoto(item.id)">
              <text class="photo-a-icon">+</text>
              <text class="photo-a-t">拍照</text>
            </view>
          </view>
          <!-- 视频/语音 -->
          <view class="media-row">
            <view class="media-btn" @click="recordPubVideo(item.id)">
              <text>{{ getPubVisual(item.id)._video ? '已录视频' : '录视频（可选）' }}</text>
              <text v-if="getPubVisual(item.id)._video" class="media-del" @click.stop="getPubVisual(item.id)._video = ''">X</text>
            </view>
            <view class="media-btn" @click="recordPubVoice(item.id)">
              <text>{{ pubRecording['pvv_' + item.id] ? '录音中...点击停止' : (getPubVisual(item.id)._voice ? '已录音 ✓' : '语音备注（可选）') }}</text>
              <text v-if="getPubVisual(item.id)._voice && !pubRecording['pvv_' + item.id]" class="media-del" @click.stop="getPubVisual(item.id)._voice = ''">X</text>
            </view>
          </view>
        </view>
      </template>
    </view>
  </view>

  <!-- 底部栏 -->
  <view class="bb">
    <view class="bb-status">
      <text>已完成 {{ doneCount }} 项</text>
      <picker mode="date" :value="deadline" @change="e => deadline = e.detail.value" style="margin-left:8px;">
        <view class="bb-deadline">{{ deadline ? deadline : '设置整改期限' }}</view>
      </picker>
    </view>
    <view class="bb-rectifier">
      <RectifierPicker v-model="rectifier" />
    </view>
    <view class="bb-btns">
      <view class="bb-draft" @click="saveDraftLocal">暂存</view>
      <view class="bb-submit" @click="submitInspection">{{ submitting ? '提交中...' : '提交检查' }}</view>
    </view>
  </view>
</scroll-view>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { INSPECTION_FORMS } from '@/config/inspection-forms'
import { saveDraft, loadDraft, removeDraft, enqueue } from '@/utils/storage'
import { compressImages } from '@/utils/media'
import { reportIssue, getEstimatedValues } from '@/api'
import InspectItem from '@/components/InspectItem.vue'
import RectifierPicker from '@/components/RectifierPicker.vue'

const types = [{ key: 'visual', label: '观感' }, { key: 'measure', label: '实测' }, { key: 'public', label: '公区' }]
const activeType = ref('visual')
const householdId = ref('')
const submitting = ref(false)
const deadline = ref('')
const rectifier = ref({ name: '', phone: '' })
const visualItems = ref([])
const md = reactive({})  // measure data
const sd = reactive({})  // sub-item data
const pm = reactive({})  // public measure data
const pubCheckData = reactive({})  // { 'stair_step': true/false }
const pubCheckDesc = reactive({})  // { 'stair_step': '描述' }
const pubCheckPhotos = reactive({}) // { 'stair_step': [...] }
const pubCheckVideo = reactive({})  // { 'stair_step': '视频路径' }
const pubCheckVoice = reactive({})  // { 'stair_step': '语音路径' }
const pubVisualState = reactive({}) // { itemId: { _hasIssue, _desc, _photos, _video, _voice } }
const estimatedValues = reactive({}) // 从后台加载的推算值

const isVisual = computed(() => activeType.value === 'visual')
const measureItems = computed(() => INSPECTION_FORMS.measure?.items || [])
const publicMeasureItems = computed(() => (INSPECTION_FORMS.public?.items || []).filter(i => i.measures?.length))
const allPublicItems = computed(() => {
  return (INSPECTION_FORMS.public?.items || []).map((item, idx) => ({
    ...item,
    seq: idx + 1,
    _hasIssue: item._hasIssue || false,
    _desc: item._desc || '',
    _photos: item._photos || [],
    _presets: item.presets || []
  }))
})
const doneCount = computed(() => {
  if (activeType.value === 'measure') return Object.keys(md).length
  if (activeType.value === 'visual') return visualItems.value.filter(i => !i._hasIssue || (i._hasIssue && i._desc)).length
  return Object.keys(pubVisualState).length + Object.keys(pm).length
})

function initVisual() {
  visualItems.value = INSPECTION_FORMS.visual.items.map(it => ({
    ...it, _hasIssue: false, _desc: '', _photos: [], _presets: [...(it.presets || [])]
  }))
}

function initPublic() {
  // 清空旧状态
  Object.keys(pubVisualState).forEach(k => delete pubVisualState[k])
  Object.keys(pm).forEach(k => delete pm[k])
  Object.keys(pubCheckData).forEach(k => delete pubCheckData[k])
  Object.keys(pubCheckDesc).forEach(k => delete pubCheckDesc[k])
  Object.keys(pubCheckPhotos).forEach(k => delete pubCheckPhotos[k])
  Object.keys(pubCheckVideo).forEach(k => delete pubCheckVideo[k])
  Object.keys(pubCheckVoice).forEach(k => delete pubCheckVoice[k])
}

function initPubMeasures() {
  const items = INSPECTION_FORMS.public?.items || []
  for (const item of items) {
    if (item.measures) {
      for (const m of item.measures) {
        if (!pm[m.key]) pm[m.key] = ''
      }
    }
  }
}

function switchType(key) {
  // 保存草稿（含 deadline）
  const tabDraft = activeType.value === 'visual' ? { items: visualItems.value } : activeType.value === 'public' ? { pvs: JSON.parse(JSON.stringify(pubVisualState)), pm: JSON.parse(JSON.stringify(pm)), pcd: JSON.parse(JSON.stringify(pubCheckData)), pcs: JSON.parse(JSON.stringify(pubCheckDesc)), pcp: JSON.parse(JSON.stringify(pubCheckPhotos)), pcv: JSON.parse(JSON.stringify(pubCheckVideo)), pcw: JSON.parse(JSON.stringify(pubCheckVoice)) } : { md: JSON.parse(JSON.stringify(md)), sd: JSON.parse(JSON.stringify(sd)) }
  saveDraft(householdId.value, activeType.value, { ...tabDraft, deadline: deadline.value, rectifierName: rectifier.value.name, rectifierPhone: rectifier.value.phone })

  activeType.value = key
  if (key === 'visual') initVisual()
  if (key === 'public') { initPublic(); initPubMeasures() }

  // 恢复草稿（含 deadline + rectifier）
  const saved = loadDraft(householdId.value, key)
  if (saved) {
    if (saved.deadline) deadline.value = saved.deadline
    if (saved.rectifierName) rectifier.value = { name: saved.rectifierName, phone: saved.rectifierPhone || '' }
    if (key === 'visual' && saved.items) visualItems.value = saved.items
    if (key === 'public') {
      if (saved.pvs) Object.assign(pubVisualState, JSON.parse(JSON.stringify(saved.pvs)))
      if (saved.pm) Object.assign(pm, JSON.parse(JSON.stringify(saved.pm)))
      if (saved.pcd) Object.assign(pubCheckData, JSON.parse(JSON.stringify(saved.pcd)))
      if (saved.pcs) Object.assign(pubCheckDesc, JSON.parse(JSON.stringify(saved.pcs)))
      if (saved.pcp) Object.assign(pubCheckPhotos, JSON.parse(JSON.stringify(saved.pcp)))
      if (saved.pcv) Object.assign(pubCheckVideo, JSON.parse(JSON.stringify(saved.pcv)))
      if (saved.pcw) Object.assign(pubCheckVoice, JSON.parse(JSON.stringify(saved.pcw)))
    }
    if (key === 'measure') { Object.assign(md, saved.md || {}); Object.assign(sd, saved.sd || {}) }
  }
}

function onAddPhoto(item) {
  uni.chooseImage({ count: 9 - (item._photos?.length || 0), success: (r) => { item._photos?.push(...r.tempFilePaths) }, fail: () => {} })
}

function togglePubCheck(key) {
  pubCheckData[key] = !pubCheckData[key]
  if (!pubCheckData[key]) { pubCheckDesc[key] = ''; pubCheckPhotos[key] = []; pubCheckVideo[key] = ''; pubCheckVoice[key] = '' }
}
function addPubCheckPhoto(key) {
  uni.chooseImage({ count: 9 - (pubCheckPhotos[key]?.length || 0), success: (r) => {
    if (!pubCheckPhotos[key]) pubCheckPhotos[key] = []
    pubCheckPhotos[key].push(...r.tempFilePaths)
  }, fail: () => {} })
}
// 公区视觉项状态管理
function getPubVisual(itemId) {
  if (!pubVisualState[itemId]) {
    pubVisualState[itemId] = { _hasIssue: false, _desc: '', _photos: [], _video: '', _voice: '' }
  }
  return pubVisualState[itemId]
}
function togglePubVisual(itemId) {
  const s = getPubVisual(itemId)
  s._hasIssue = !s._hasIssue
  if (!s._hasIssue) { s._desc = ''; s._photos = []; s._video = ''; s._voice = '' }
}
function setPubVisualDesc(itemId, val) {
  const s = getPubVisual(itemId)
  s._desc = s._desc === val ? '' : val
}
function addPubVisualPhoto(itemId) {
  uni.chooseImage({ count: 9 - (getPubVisual(itemId)._photos?.length || 0), success: (r) => {
    getPubVisual(itemId)._photos.push(...r.tempFilePaths)
  }, fail: () => {} })
}

// ===== 录音状态追踪（弹窗式 + 状态反馈） =====
const pubRecording = reactive({})

const pubRecorders = reactive({})

function startVoiceRecording(key, onDone) {
  // 正在录音 → 点击停止
  if (pubRecording[key] && pubRecorders[key]) {
    pubRecorders[key].stop()
    return
  }
  const recorder = uni.getRecorderManager()
  pubRecorders[key] = recorder
  recorder.onStart(() => { pubRecording[key] = true })
  recorder.onStop((r) => {
    pubRecording[key] = false
    delete pubRecorders[key]
    if (r.tempFilePath) onDone(r.tempFilePath)
  })
  recorder.onError(() => {
    pubRecording[key] = false
    delete pubRecorders[key]
  })
  uni.showModal({
    title: '语音备注',
    content: '点击确定开始录音（最长30秒）',
    success: (res) => {
      if (res.confirm) {
        recorder.start({ format: 'mp3' })
        setTimeout(() => { if (pubRecording[key]) recorder.stop() }, 30000)
      } else {
        delete pubRecorders[key]
      }
    }
  })
}

// 公区视觉项（纯视觉）视频/语音
function recordPubVideo(itemId) {
  uni.chooseVideo({ sourceType: ['camera', 'album'], maxDuration: 30, success: (r) => { getPubVisual(itemId)._video = r.tempFilePath }, fail: () => {} })
}
function recordPubVoice(itemId) {
  startVoiceRecording('pvv_' + itemId, (path) => { getPubVisual(itemId)._voice = path })
}

// 公区楼梯子项视频/语音
function recordPubCheckVideo(key) {
  uni.chooseVideo({ sourceType: ['camera', 'album'], maxDuration: 30, success: (r) => { pubCheckVideo[key] = r.tempFilePath }, fail: () => {} })
}
function recordPubCheckVoice(key) {
  startVoiceRecording('pcv_' + key, (path) => { pubCheckVoice[key] = path })
}

function roomLabel(r) {
  const m = { living: '客厅+餐厅', master_bedroom: '主卧室', master_bath: '主卫', bathroom: '卫生间', kitchen: '厨房', west_bedroom: '西卧室', east_bedroom: '东卧室', south_bedroom: '南卧室' }
  return m[r] || r
}

function saveDraftLocal() {
  const tabData = activeType.value === 'visual' ? visualItems.value : activeType.value === 'public' ? { pvs: JSON.parse(JSON.stringify(pubVisualState)), pm: JSON.parse(JSON.stringify(pm)), pcd: JSON.parse(JSON.stringify(pubCheckData)), pcs: JSON.parse(JSON.stringify(pubCheckDesc)), pcp: JSON.parse(JSON.stringify(pubCheckPhotos)), pcv: JSON.parse(JSON.stringify(pubCheckVideo)), pcw: JSON.parse(JSON.stringify(pubCheckVoice)) } : { md: JSON.parse(JSON.stringify(md)), sd: JSON.parse(JSON.stringify(sd)) }
  saveDraft(householdId.value, activeType.value, { ...tabData, deadline: deadline.value, rectifierName: rectifierName.value, rectifierPhone: rectifierPhone.value })
  uni.showToast({ title: '已保存', icon: 'none', duration: 1000 })
}

async function submitInspection() {
  if (submitting.value) return
  if (!rectifier.value.name) { uni.showToast({ title: '请选择整改人', icon: 'none' }); submitting.value = false; return }
  submitting.value = true

  const rName = rectifier.value.name
  const rPhone = rectifier.value.phone
  const issueList = []

  if (activeType.value === 'visual') {
    for (const item of visualItems.value) {
      if (item._hasIssue && item._desc) {
        issueList.push({ householdId: householdId.value, type: 'visual', category: item.name, description: item._desc, photos: item._photos || [], remark: '', deadline: deadline.value, rectifierName: rName, rectifierPhone: rPhone })
      }
    }
  } else if (activeType.value === 'measure') {
    const items = INSPECTION_FORMS.measure.items
    for (const item of items) {
      if (item.perRoom) {
        for (const room of item.rooms) {
          const v = md[`${item.id}_${room}`]
          if (v && parseInt(v) > 5) {
            issueList.push({ householdId: householdId.value, type: 'measure', category: item.name, description: `${roomLabel(room)}实测${v}mm偏差超限`, photos: [], remark: '', deadline: deadline.value, rectifierName: rName, rectifierPhone: rPhone })
          }
        }
      }
    }
  } else if (activeType.value === 'public') {
    const pitems = INSPECTION_FORMS.public.items
    for (const item of pitems) {
      // 实测项
      if (item.measures) {
        for (const m of item.measures) {
          const v = pm[m.key]
          const ev = estimatedValues[m.key]
          if (v && ev && Math.abs(parseInt(v) - ev) > 5) {
            issueList.push({ householdId: householdId.value, type: 'public', category: item.name, description: `${m.label}实测${v}mm偏差超限`, photos: [], remark: '' })
          }
        }
      }
      // 视觉检查子项（楼梯）
      if (item.visualChecks) {
        for (const vc of item.visualChecks) {
          if (pubCheckData[vc.key] && pubCheckDesc[vc.key]) {
            issueList.push({ householdId: householdId.value, type: 'public', category: item.name, description: `${vc.label}: ${pubCheckDesc[vc.key]}`, photos: pubCheckPhotos[vc.key] || [], remark: '', deadline: deadline.value, rectifierName: rName, rectifierPhone: rPhone })
          }
        }
      }
      // 纯视觉项
      if (!item.measures && !item.visualChecks) {
        const vs = pubVisualState[item.id]
        if (vs && vs._hasIssue && vs._desc) {
          issueList.push({ householdId: householdId.value, type: 'public', category: item.name, description: vs._desc, photos: vs._photos || [], remark: '', deadline: deadline.value, rectifierName: rName, rectifierPhone: rPhone })
        }
      }
    }
  }

  // 网络检测
  const netOk = await new Promise(r => { uni.getNetworkType({ success: (res) => r(res.networkType !== 'none'), fail: () => r(true) }) })

  if (!netOk) {
    enqueue({ householdId: householdId.value, type: activeType.value, issues: issueList })
    uni.showToast({ title: '已暂存，联网后上传', icon: 'none' })
    removeDraft(householdId.value, activeType.value)
  } else {
    if (issueList.length > 0) {
      // 并发提交
      for (const issue of issueList) { await reportIssue(issue) }
    }
    removeDraft(householdId.value, activeType.value)
    const msg = issueList.length > 0 ? `发现 ${issueList.length} 项问题` : '全部合格'
    uni.showToast({ title: msg, icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  }

  submitting.value = false
}

onLoad(async (options) => {
  householdId.value = options?.householdId || ''
  initVisual()
  const saved = loadDraft(householdId.value, 'visual')
  if (saved) {
    if (saved.deadline) deadline.value = saved.deadline
    if (saved.rectifierName) rectifier.value = { name: saved.rectifierName, phone: saved.rectifierPhone || '' }
    if (saved.items) visualItems.value = saved.items
  }
  // 加载推算值（从后端/Mock）
  const ev = await getEstimatedValues()
  if (ev.code === 0) Object.assign(estimatedValues, ev.data)
})
</script>

<style lang="scss" scoped>
.page { padding: 0 12px; width: 100%; box-sizing: border-box; overflow-x: hidden; }
.seg-lg { display: flex; gap: 6px; margin: 12px 0; }
.seg-item-lg { flex: 1; text-align: center; padding: 10px; border-radius: 6px; border: 1px solid $border; font-size: 13px; color: $text-secondary; }
.seg-item-lg.active { background: $primary-light; color: $primary; border-color: $primary; font-weight: 600; }

/* 实测卡片 */
.m-card { padding: 12px; margin-bottom: 8px; box-sizing: border-box; max-width: 100%; }
.m-hd { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; min-width: 0; }
.m-name { font-size: 13px; font-weight: 600; color: $text-primary; display: block; }
.m-desc { font-size: 10px; color: $text-secondary; margin-top: 2px; }
.m-room, .m-single { padding: 8px; background: $bg-page; border-radius: 6px; margin-bottom: 6px; box-sizing: border-box; }

/* 公区视觉检查子项（楼梯） */
.sub-check-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 6px 0; border-bottom: 1px solid $border-light; }
.sub-check-row:last-child { border-bottom: none; }
.sub-check-label { flex: 1; font-size: 12px; color: $text-primary; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.check-hd { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
.check-num { width: 22px; height: 22px; border-radius: 50%; background: $primary-light; color: $primary; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.check-info { flex: 1; min-width: 0; }
.check-name { font-size: 13px; font-weight: 600; color: $text-primary; }

.check-toggle-inline { padding: 3px 12px; border-radius: 14px; font-size: 10px; font-weight: 600; background: #FEF2F2; color: $danger; flex-shrink: 0; white-space: nowrap; display: inline-flex; align-items: center; min-width: 48px; justify-content: center; }
.check-toggle-inline.pass { background: #F0FDF4; color: $success; }

/* 实测差值 */
.diff-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 10px; margin-top: 4px; }
.diff-pass { color: $success; font-weight: 600; }
.diff-fail { color: $danger; font-weight: 600; }

/* 公区视觉5-15 */
.preset-r { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.preset-item { padding: 3px 8px; border: 1px solid $border; border-radius: 4px; font-size: 10px; color: $text-secondary; }
.preset-item.selected { background: $primary-light; border-color: $primary; color: $primary; }
.textarea { width: 100%; padding-left: 10px; padding-right: 10px; padding-top: 0; padding-bottom: 0; border: 1px solid $border; border-radius: 6px; font-size: 12px; min-height: 40px; line-height: 20px; margin-top: 6px; box-sizing: border-box; max-width: 100%; }

/* 照片网格 */
.photo-g { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 6px; }
.photo-i { position: relative; aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: $border-light; }
.photo-i image { width: 100%; height: 100%; }
.photo-d { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: rgba(0,0,0,.5); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
.photo-a { aspect-ratio: 1; border: 1px dashed $text-placeholder; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.photo-a-icon { font-size: 22px; color: $text-hint; line-height: 1; }
.photo-a-t { font-size: 10px; color: $text-hint; margin-top: 2px; }

/* 视频/语音按钮 */
.media-row { display: flex; gap: 6px; margin-top: 6px; }
.media-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 2px; padding: 4px 0; border: 1px solid $border; border-radius: 4px; font-size: 10px; color: $text-secondary; position: relative; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.media-del { position: absolute; top: -6px; right: -6px; width: 16px; height: 16px; background: $danger; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; }
.mr-label { font-size: 12px; font-weight: 600; color: $text-primary; }
.mr-row { display: flex; gap: 6px; margin-top: 4px; }
.mr-cell { flex: 1; min-width: 0; }
.mr-cell.estimated { flex: .55; opacity: .6; min-width: 0; }
.mr-lbl { font-size: 10px; color: $text-hint; display: block; }
.mr-val { font-size: 13px; font-weight: 600; color: $text-primary; padding: 6px 0; }
.mr-inp { width: 100%; max-width: 100%; padding-left: 8px; padding-right: 8px; padding-top: 0; padding-bottom: 0; height: 40px; line-height: 40px; border: 1px solid $border; border-radius: 6px; font-size: 13px; box-sizing: border-box; background: $bg-card; text-align: right; }

/* 底部 */
.bb { position: fixed; bottom: 0; left: 0; right: 0; background: $bg-card; border-top: 1px solid $border; padding: 10px 16px 20px; }
.bb-status { font-size: 11px; color: $text-hint; margin-bottom: 6px; display: flex; align-items: center; }
.bb-deadline { font-size: 11px; color: $primary; padding: 2px 8px; border: 1px dashed $primary-dim; border-radius: 4px; }
.bb-rectifier { display: flex; gap: 6px; margin-bottom: 6px; }
.bb-inp { flex: 1; padding-left: 8px; padding-right: 8px; padding-top: 0; padding-bottom: 0; height: 36px; line-height: 36px; border: 1px solid $border; border-radius: 6px; font-size: 12px; box-sizing: border-box; background: $bg-card; }
.bb-btns { display: flex; gap: 10px; }
.bb-draft { flex: 1; text-align: center; padding: 10px; border: 1.5px solid $primary; border-radius: 8px; font-size: 13px; font-weight: 600; color: $primary; }
.bb-submit { flex: 2; text-align: center; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; background: $primary; color: #fff; }
</style>
