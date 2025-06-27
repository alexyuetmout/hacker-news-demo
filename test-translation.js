const { TranslationService } = require('./lib/services/translation.ts')

async function testTranslation() {
  const translator = new TranslationService()
  
  console.log('测试单个文本翻译...')
  const singleResult = await translator.translateText(
    'Show HN: I built a real-time collaborative whiteboard using WebRTC',
    'en',
    'zh'
  )
  console.log('原文:', 'Show HN: I built a real-time collaborative whiteboard using WebRTC')
  console.log('翻译:', singleResult)
  console.log('---')
  
  console.log('测试批量翻译...')
  const batchTexts = [
    'Apple releases new iPhone with better camera',
    'Google announces new AI model that can code',
    'Microsoft acquires GitHub for $7.5 billion'
  ]
  
  const batchResults = await translator.translateBatch(batchTexts)
  
  batchTexts.forEach((original, index) => {
    console.log(`${index + 1}. 原文: ${original}`)
    console.log(`   翻译: ${batchResults[index]}`)
  })
}

testTranslation().catch(console.error) 