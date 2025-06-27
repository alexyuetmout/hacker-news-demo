require('dotenv').config({ path: '.env.local' })

const { DataService } = require('../lib/services/data')

async function syncComments() {
  console.log('开始同步评论...')
  
  const dataService = new DataService()
  
  try {
    // 获取前几个故事
    const stories = await dataService.getStories('top', 1, 5)
    console.log(`找到 ${stories.stories.length} 个故事`)
    
    for (const story of stories.stories) {
      console.log(`正在处理故事: ${story.title}`)
      console.log(`HN ID: ${story.hnId}, 评论数: ${story.descendants}`)
      
      if (story.descendants > 0) {
        // 通过API获取故事详情来同步评论
        await dataService.updateStoriesFromHN('top', 1)
        console.log('已触发评论同步')
        break // 只处理第一个有评论的故事
      }
    }
    
    console.log('同步完成')
  } catch (error) {
    console.error('同步失败:', error)
  }
}

syncComments() 