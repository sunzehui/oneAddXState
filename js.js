const axios = require('axios')
// *****************配置区*****************
// QQ群号，逗号分隔
qqGroup = [
    
]
// 填写登录url
const url = ""
// *****************配置区*****************
async function getStatus() {
    try {
        const url2 = "https://vslc.ncb.edu.cn/admin/complex/crsXzhStudInfoAction/getStudExamPlanList"
        const url3 = "https://vslc.ncb.edu.cn/admin/complex/crsXzhStudInfoAction/getStudExamCertificateList?planId="
        const head = {
            'Authorization': 'Basic MToxMjM0NTY=',
            "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
        }
        const user = await axios.post(url, {}, {headers: head})
        const cookie = user.headers['set-cookie']

        let planId = (await axios.get(url2, {
            headers: {
                Cookie: cookie,
                token: user.data.data.token
            }
        })).data.data[0].planId

        let rcv = await axios.get(url3+planId, {
            headers: {
                Cookie: cookie,
                token: user.data.data.token
            }
        })
        return rcv.data.data[0].examState
    } catch (err) {
        return err.toString()
    }
}

async function sendMessage(id, msg) {
    const url = `http://182.254.245.231:5701/send_group_msg`
    const state = await axios.get(url, {
        params: {
            group_id: id,
            message: msg
        }
    })
    return state.data
}

function sleep(time) {
    return new Promise(resolve => setTimeout(() => resolve, time))
}

async function computType(state) {
    switch (state) {
        case 4:
            return "成绩登记中"
        case 5:
            return "成绩公示中"
        case 6:
            return "考试已结束"
    }

}

async function task(group_id, data) {
    return async function () {
        return await sendMessage(group_id, data);
    }
}


async function main() {
    try {
        const data = await computType(await getStatus())
        let tasks = []
        qqGroup.forEach((group_id) => {
            tasks.push(task(group_id, data));
        })

        for await (const f of tasks) {
            console.log(await f())
        }
        return true
    } catch (e) {
        return e
    }

}

main().then(state => {
    console.log(state ? "执行完毕" : state)
})
