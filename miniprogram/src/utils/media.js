// 多媒体工具 — 图片压缩 + 并发控制

// 压缩图片（微信小程序）
export function compressImage(filePath) {
  return new Promise((resolve) => {
    wx.compressImage({
      src: filePath,
      quality: 70,
      success: (res) => resolve(res.tempFilePath),
      fail: () => resolve(filePath) // 压缩失败返回原图
    })
  })
}

// 批量压缩 + 限制并发数
export async function compressImages(paths, concurrency = 3) {
  const results = []
  for (let i = 0; i < paths.length; i += concurrency) {
    const batch = paths.slice(i, i + concurrency)
    const compressed = await Promise.all(batch.map(p => compressImage(p)))
    results.push(...compressed)
  }
  return results
}

// 选择图片（拍照或相册）
export function chooseImages(count = 9) {
  return new Promise((resolve) => {
    uni.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => resolve(res.tempFilePaths),
      fail: () => resolve([])
    })
  })
}

// 选择视频
export function chooseVideo() {
  return new Promise((resolve) => {
    uni.chooseVideo({
      sourceType: ['camera', 'album'],
      maxDuration: 30,
      success: (res) => resolve(res.tempFilePath),
      fail: () => resolve('')
    })
  })
}

// 录音
export function recordVoice(duration = 10000) {
  return new Promise((resolve) => {
    const recorder = uni.getRecorderManager()
    recorder.onStop((res) => { resolve(res.tempFilePath || '') })
    recorder.onError(() => { resolve('') })
    recorder.start({ format: 'mp3', duration })
    setTimeout(() => {
      try { recorder.stop() } catch {}
    }, duration - 500)
  })
}
