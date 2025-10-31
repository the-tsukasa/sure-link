// 测试数据生成器 - 用于演示遭遇历史功能
// 使用方法：在浏览器控制台运行 generateTestEncounters()

function generateTestEncounters() {
    const testUsers = [
        { name: 'Taro', location: '新宿駅', distance: 50 },
        { name: 'Hanako', location: '渋谷スクランブル交差点', distance: 120 },
        { name: 'Yuki', location: '原宿駅', distance: 85 },
        { name: 'Kenji', location: '東京タワー', distance: 200 },
        { name: 'Sakura', location: '上野公園', distance: 45 },
        { name: 'Hiro', location: '秋葉原駅', distance: 95 },
        { name: 'Mina', location: '浅草寺', distance: 150 },
        { name: 'Ryu', location: '池袋駅', distance: 75 },
        { name: 'Aiko', location: '六本木ヒルズ', distance: 110 },
        { name: 'Ken', location: '品川駅', distance: 180 }
    ];

    const encounters = [];
    const now = Date.now();

    testUsers.forEach((user, index) => {
        // 生成不同时间的遭遇
        const timestamp = now - (index * 3600000); // 每个遭遇间隔1小时
        
        encounters.push({
            user: user.name,
            distance: user.distance,
            location: user.location,
            timestamp: timestamp,
            likes: Math.floor(Math.random() * 10),  // 随机点赞数 0-9
            liked: Math.random() > 0.5              // 随机点赞状态
        });
    });

    // 保存到 localStorage
    localStorage.setItem('encounters', JSON.stringify(encounters));

    console.log('✅ 测试数据已生成！');
    console.log(`📊 共生成 ${encounters.length} 条遭遇记录`);
    console.log('🔄 刷新页面查看效果');
    
    return encounters;
}

// 清除测试数据
function clearTestEncounters() {
    localStorage.removeItem('encounters');
    console.log('🧹 测试数据已清除');
    console.log('🔄 刷新页面查看效果');
}

// 生成单条遭遇（用于实时测试）
function addTestEncounter() {
    const names = ['Taro', 'Hanako', 'Yuki', 'Kenji', 'Sakura'];
    const locations = ['新宿駅', '渋谷駅', '原宿駅', '池袋駅', '上野駅'];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomDistance = Math.floor(Math.random() * 200) + 20;
    
    const encounters = JSON.parse(localStorage.getItem('encounters') || '[]');
    encounters.unshift({
        user: randomName,
        distance: randomDistance,
        location: randomLocation,
        timestamp: Date.now(),
        likes: 0,
        liked: false
    });
    
    // 只保留最近100条
    if (encounters.length > 100) {
        encounters.length = 100;
    }
    
    localStorage.setItem('encounters', JSON.stringify(encounters));
    
    console.log(`✅ 添加了一条新遭遇: ${randomName} @ ${randomLocation} (${randomDistance}m)`);
    console.log('🔄 刷新页面或触发 storage 事件查看效果');
    
    // 触发 storage 事件（同一页面）
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'encounters',
        newValue: JSON.stringify(encounters)
    }));
}

// 暴露到全局
window.generateTestEncounters = generateTestEncounters;
window.clearTestEncounters = clearTestEncounters;
window.addTestEncounter = addTestEncounter;

console.log('🎉 遭遇历史测试工具已加载');
console.log('📝 可用命令:');
console.log('  - generateTestEncounters()  生成10条测试数据');
console.log('  - addTestEncounter()        添加1条随机遭遇');
console.log('  - clearTestEncounters()     清除所有测试数据');

