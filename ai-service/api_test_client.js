/**
 * iOffer AI API 测试客户端 (JavaScript)
 * 
 * 用于测试 WebSocket API 的各种功能，包括连接、消息发送、响应接收等。
 * 可以在浏览器控制台或 Node.js 环境中使用。
 */

class IOfferAPITestClient {
    constructor(url = 'ws://127.0.0.1:8010/ws') {
        this.url = url;
        this.ws = null;
        this.connected = false;
        this.messageCount = 0;
        this.responseCount = 0;
        this.messageQueue = [];
        this.onMessageCallback = null;
        this.onErrorCallback = null;
        this.onConnectCallback = null;
        this.onDisconnectCallback = null;
    }

    /**
     * 连接到 WebSocket 服务器
     * @returns {Promise<boolean>} 连接是否成功
     */
    connect() {
        return new Promise((resolve, reject) => {
            try {
                console.log(`🔌 正在连接到 ${this.url}...`);
                
                this.ws = new WebSocket(this.url);
                
                this.ws.onopen = () => {
                    this.connected = true;
                    console.log('✅ WebSocket 连接成功！');
                    
                    if (this.onConnectCallback) {
                        this.onConnectCallback();
                    }
                    
                    // 发送队列中的消息
                    this.flushMessageQueue();
                    
                    resolve(true);
                };
                
                this.ws.onerror = (error) => {
                    console.error('❌ WebSocket 连接错误:', error);
                    this.connected = false;
                    
                    if (this.onErrorCallback) {
                        this.onErrorCallback(error);
                    }
                    
                    reject(error);
                };
                
                this.ws.onclose = () => {
                    console.log('🔌 WebSocket 连接已关闭');
                    this.connected = false;
                    
                    if (this.onDisconnectCallback) {
                        this.onDisconnectCallback();
                    }
                };
                
                this.ws.onmessage = (event) => {
                    this.responseCount++;
                    console.log(`📥 收到响应 #${this.responseCount}`);
                    
                    try {
                        const data = JSON.parse(event.data);
                        this.handleResponse(data);
                        
                        if (this.onMessageCallback) {
                            this.onMessageCallback(data);
                        }
                    } catch (error) {
                        console.error('❌ 消息解析错误:', error);
                    }
                };
                
            } catch (error) {
                console.error('❌ 创建 WebSocket 失败:', error);
                reject(error);
            }
        });
    }

    /**
     * 断开 WebSocket 连接
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.connected = false;
            console.log('🔌 连接已断开');
        }
    }

    /**
     * 发送消息到服务器
     * @param {string} content - 消息内容
     * @param {string} userId - 用户ID
     * @returns {boolean} 发送是否成功
     */
    sendMessage(content, userId = 'test_user') {
        if (!this.connected) {
            console.log('⏳ 连接中，消息已加入队列...');
            this.messageQueue.push({ content, userId });
            return false;
        }

        try {
            const message = {
                type: 'message',
                content: content,
                user_id: userId
            };

            this.ws.send(JSON.stringify(message));
            this.messageCount++;
            console.log(`📤 已发送消息 #${this.messageCount}: ${content.substring(0, 50)}...`);
            return true;

        } catch (error) {
            console.error('❌ 发送消息失败:', error);
            return false;
        }
    }

    /**
     * 发送队列中的消息
     */
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const { content, userId } = this.messageQueue.shift();
            this.sendMessage(content, userId);
        }
    }

    /**
     * 处理服务器响应
     * @param {Object} data - 响应数据
     */
    handleResponse(data) {
        if (data.type === 'result') {
            this.printResponse(data);
        } else if (data.type === 'error') {
            this.printError(data);
        } else {
            console.log(`📝 其他响应类型: ${data.type}`, data);
        }
    }

    /**
     * 格式化打印响应数据
     * @param {Object} data - 响应数据
     */
    printResponse(data) {
        console.log('\n' + '='.repeat(60));
        console.log('🤖 AI 回答:');
        console.log('-'.repeat(30));
        console.log(data.message);

        if (data.thinking_process) {
            console.log('\n🧠 思考过程:');
            console.log('-'.repeat(30));
            console.log(data.thinking_process);
        }

        if (data.reference_links && data.reference_links.length > 0) {
            console.log('\n🔗 参考链接:');
            console.log('-'.repeat(30));
            data.reference_links.forEach((link, index) => {
                console.log(`${index + 1}. ${link}`);
            });
        }

        if (data.strategy) {
            console.log(`\n📋 策略: ${data.strategy}`);
        }

        if (data.source) {
            console.log(`📚 来源: ${data.source}`);
        }

        if (data.rag_similarity !== undefined) {
            console.log(`🎯 RAG 相似度: ${data.rag_similarity}`);
        }

        if (data.team_used) {
            console.log(`👥 使用团队: ${data.team_used}`);
        }

        console.log('='.repeat(60) + '\n');
    }

    /**
     * 打印错误信息
     * @param {Object} data - 错误数据
     */
    printError(data) {
        console.log('\n❌ 错误响应:');
        console.log(`   错误代码: ${data.error_code || 'UNKNOWN'}`);
        console.log(`   错误信息: ${data.message || '未知错误'}`);
        if (data.details) {
            console.log(`   详细信息: ${data.details}`);
        }
        console.log();
    }

    /**
     * 设置消息处理回调
     * @param {Function} callback - 回调函数
     */
    onMessage(callback) {
        this.onMessageCallback = callback;
    }

    /**
     * 设置错误处理回调
     * @param {Function} callback - 回调函数
     */
    onError(callback) {
        this.onErrorCallback = callback;
    }

    /**
     * 设置连接成功回调
     * @param {Function} callback - 回调函数
     */
    onConnect(callback) {
        this.onConnectCallback = callback;
    }

    /**
     * 设置断开连接回调
     * @param {Function} callback - 回调函数
     */
    onDisconnect(callback) {
        this.onDisconnectCallback = callback;
    }

    /**
     * 获取连接状态
     * @returns {string} 连接状态
     */
    getConnectionState() {
        if (!this.ws) return 'disconnected';
        
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return 'connecting';
            case WebSocket.OPEN: return 'connected';
            case WebSocket.CLOSING: return 'closing';
            case WebSocket.CLOSED: return 'closed';
            default: return 'unknown';
        }
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            messageCount: this.messageCount,
            responseCount: this.responseCount,
            connectionState: this.getConnectionState(),
            queueLength: this.messageQueue.length
        };
    }
}

/**
 * API 测试套件
 */
class APITestSuite {
    constructor(client) {
        this.client = client;
        this.testResults = [];
    }

    /**
     * 运行连接测试
     */
    async testConnection() {
        console.log('🔍 测试 1: 连接功能');
        console.log('-'.repeat(40));

        try {
            const success = await this.client.connect();
            if (success) {
                console.log('✅ 连接测试通过');
                this.testResults.push({ test: 'Connection', status: 'PASS' });
            } else {
                console.log('❌ 连接测试失败');
                this.testResults.push({ test: 'Connection', status: 'FAIL' });
            }
            return success;
        } catch (error) {
            console.log('❌ 连接测试出错:', error);
            this.testResults.push({ test: 'Connection', status: 'ERROR', error: error.message });
            return false;
        }
    }

    /**
     * 运行通用问答测试
     */
    async testGeneralQA() {
        console.log('🔍 测试 2: 通用问答功能');
        console.log('-'.repeat(40));

        const testQuestions = [
            '什么是人工智能？',
            '介绍一下哈佛大学',
            'Python 编程语言有什么特点？'
        ];

        for (let i = 0; i < testQuestions.length; i++) {
            const question = testQuestions[i];
            console.log(`\n📝 测试问题 ${i + 1}: ${question}`);

            if (this.client.sendMessage(question)) {
                // 等待响应
                await this.waitForResponse(30000);
            }

            // 等待一下再发送下一条
            await this.sleep(2000);
        }

        console.log('✅ 通用问答测试完成');
        this.testResults.push({ test: 'General QA', status: 'PASS' });
    }

    /**
     * 运行学校推荐测试
     */
    async testSchoolRecommendation() {
        console.log('🔍 测试 3: 学校推荐功能');
        console.log('-'.repeat(40));

        const testRequests = [
            '我是一名计算机科学专业的学生，GPA 3.8，想申请美国的研究生项目，请推荐一些学校',
            '我是商科专业，托福 95，预算每年 4 万美元，推荐一些适合的学校'
        ];

        for (let i = 0; i < testRequests.length; i++) {
            const request = testRequests[i];
            console.log(`\n📝 测试请求 ${i + 1}: ${request}`);

            if (this.client.sendMessage(request)) {
                await this.waitForResponse(30000);
            }

            await this.sleep(2000);
        }

        console.log('✅ 学校推荐测试完成');
        this.testResults.push({ test: 'School Recommendation', status: 'PASS' });
    }

    /**
     * 运行学生信息收集测试
     */
    async testStudentInfo() {
        console.log('🔍 测试 4: 学生信息收集功能');
        console.log('-'.repeat(40));

        const testInfo = [
            '我叫张三，25岁，计算机科学专业，GPA 3.7，托福 100，GRE 320',
            '我是李四，22岁，商科专业，GPA 3.5，雅思 7.0'
        ];

        for (let i = 0; i < testInfo.length; i++) {
            const info = testInfo[i];
            console.log(`\n📝 测试信息 ${i + 1}: ${info}`);

            if (this.client.sendMessage(info)) {
                await this.waitForResponse(30000);
            }

            await this.sleep(2000);
        }

        console.log('✅ 学生信息收集测试完成');
        this.testResults.push({ test: 'Student Info', status: 'PASS' });
    }

    /**
     * 运行错误处理测试
     */
    async testErrorHandling() {
        console.log('🔍 测试 5: 错误处理');
        console.log('-'.repeat(40));

        console.log('📝 测试无效消息格式...');
        try {
            if (this.client.ws) {
                this.client.ws.send('invalid json');
                await this.waitForResponse(10000);
            }
        } catch (error) {
            console.log('❌ 发送无效消息时出错:', error);
        }

        console.log('✅ 错误处理测试完成');
        this.testResults.push({ test: 'Error Handling', status: 'PASS' });
    }

    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('🚀 开始运行 iOffer AI API 测试套件');
        console.log('='.repeat(60));

        try {
            // 测试连接
            if (!await this.testConnection()) {
                console.log('❌ 连接测试失败，无法继续其他测试');
                return;
            }

            // 等待一下确保连接稳定
            await this.sleep(1000);

            // 运行功能测试
            await this.testGeneralQA();
            await this.sleep(2000);

            await this.testSchoolRecommendation();
            await this.sleep(2000);

            await this.testStudentInfo();
            await this.sleep(2000);

            await this.testErrorHandling();

            console.log('\n🎉 所有测试完成！');
            this.printTestSummary();

        } catch (error) {
            console.error('❌ 测试过程中出错:', error);
        } finally {
            this.client.disconnect();
        }
    }

    /**
     * 等待响应
     * @param {number} timeout - 超时时间（毫秒）
     */
    async waitForResponse(timeout) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    console.log('⏰ 等待响应超时');
                    resolve();
                }
            }, 100);
        });
    }

    /**
     * 延时函数
     * @param {number} ms - 延时毫秒数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 打印测试总结
     */
    printTestSummary() {
        console.log('\n📊 测试总结:');
        console.log('-'.repeat(30));
        
        this.testResults.forEach(result => {
            const status = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${status} ${result.test}: ${result.status}`);
            if (result.error) {
                console.log(`   错误: ${result.error}`);
            }
        });

        const stats = this.client.getStats();
        console.log('\n📈 统计信息:');
        console.log(`   发送消息: ${stats.messageCount}`);
        console.log(`   接收响应: ${stats.responseCount}`);
        console.log(`   连接状态: ${stats.connectionState}`);
    }
}

/**
 * 交互式测试模式
 */
class InteractiveTester {
    constructor(client) {
        this.client = client;
        this.isRunning = false;
    }

    /**
     * 启动交互式测试
     */
    async start() {
        console.log('🎮 进入交互式测试模式');
        console.log('输入 "quit" 退出，输入 "help" 查看帮助，输入 "stats" 查看统计');

        this.isRunning = true;

        // 设置消息处理
        this.client.onMessage((data) => {
            // 消息已经在客户端中处理，这里不需要额外处理
        });

        // 设置错误处理
        this.client.onError((error) => {
            console.error('❌ 连接错误:', error);
        });

        // 设置断开连接处理
        this.client.onDisconnect(() => {
            console.log('🔌 连接已断开');
            this.isRunning = false;
        });

        // 连接服务器
        try {
            await this.client.connect();
        } catch (error) {
            console.error('❌ 无法连接到服务器:', error);
            return;
        }

        // 开始交互循环
        this.startInteractiveLoop();
    }

    /**
     * 启动交互循环
     */
    startInteractiveLoop() {
        // 在浏览器环境中，这里需要用户手动输入
        // 在 Node.js 环境中，可以使用 readline 模块
        console.log('\n💡 提示: 在浏览器控制台中，您可以直接调用以下方法:');
        console.log('   client.sendMessage("您的问题", "用户ID")');
        console.log('   client.getStats()');
        console.log('   client.disconnect()');
    }

    /**
     * 发送测试消息
     * @param {string} message - 消息内容
     * @param {string} userId - 用户ID
     */
    sendTestMessage(message, userId = 'test_user') {
        if (!this.isRunning) {
            console.log('❌ 测试器未运行');
            return;
        }

        this.client.sendMessage(message, userId);
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return this.client.getStats();
    }

    /**
     * 停止测试
     */
    stop() {
        this.isRunning = false;
        this.client.disconnect();
        console.log('🛑 交互式测试已停止');
    }
}

// 导出类（如果在 Node.js 环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        IOfferAPITestClient,
        APITestSuite,
        InteractiveTester
    };
}

// 在浏览器环境中，将类添加到全局对象
if (typeof window !== 'undefined') {
    window.IOfferAPITestClient = IOfferAPITestClient;
    window.APITestSuite = APITestSuite;
    window.InteractiveTester = InteractiveTester;
}

// 使用示例
if (typeof window !== 'undefined') {
    console.log('🚀 iOffer AI API 测试客户端已加载！');
    console.log('使用方法:');
    console.log('1. 创建客户端: const client = new IOfferAPITestClient()');
    console.log('2. 连接服务器: await client.connect()');
    console.log('3. 发送消息: client.sendMessage("您的问题")');
    console.log('4. 运行测试: const testSuite = new APITestSuite(client); await testSuite.runAllTests()');
}
