export const specialList = 
	{
	    "code": 200,
	    "msg": "成功",
	    "data": [
	        {
	            "id": 1,
	            "agent_name": "笆斗", //专区名称
	            "partitions_number": 3, //分区数量
	            "vehicles_number": 0, //车辆数
	            "balance": 60, //专区余额
	            "image": "aaa.png" //图片
	        }, 
	        {
	            "id": 5,
	            "agent_name": "谜底",
	            "partitions_number": 2,
	            "vehicles_number": 1,
	            "balance": 0,
	            "image": "aaa.png"
	        }
	        
	    ],
	    "traceId": "69576bf3a91ba"
	}


export const myInfo = {
    "code": 200,
    "msg": "成功",
    "data": {
        "username": "",
        "wallet": {
            "balance": 60, //电池
            "energy": 20 //能量
        }
    },
    "traceId": "695762fe8032a"
}

// 我的预约
export const reservationList = 
{
    "code": 200,
    "msg": "",
    "data": {
        "page": 1,
        "size": 10,
        "total": 1,
        "isLast": 1,
        "content": [
            {
                "id": 1,
                "vehicle_name": "飞车21111", //车辆名称
                "vehicle_id": 12, 
                "order_no": "aaacasd13213121", //预约号
                "billing_method": 0, //计费方式 0按时间 1按次
                "venue_id": 1,  
                "venue_name": "测试", //场地名称
                "appeal_status": 0, //申诉状态 0未申请 1待处理 2已处理
                "reservation_status": 1,//预约状态 1已预约 2待使用 3使用中 4已完成 5已取消
                "order_time": 1766671601 //订单时间戳
            },
			{
			    "id": 1,
			    "vehicle_name": "飞车21111", //车辆名称
			    "vehicle_id": 12, 
			    "order_no": "aaacasd13213121", //预约号
			    "billing_method": 0, //计费方式 0按时间 1按次
			    "venue_id": 1,  
			    "venue_name": "测试", //场地名称
			    "appeal_status": 0, //申诉状态 0未申请 1待处理 2已处理
			    "reservation_status": 2,//预约状态 1已预约 2待使用 3使用中 4已完成 5已取消
			    "order_time": 1766671601 //订单时间戳
			},
			{
			    "id": 1,
			    "vehicle_name": "飞车21111", //车辆名称
			    "vehicle_id": 12, 
			    "order_no": "aaacasd13213121", //预约号
			    "billing_method": 0, //计费方式 0按时间 1按次
			    "venue_id": 1,  
			    "venue_name": "测试", //场地名称
			    "appeal_status": 0, //申诉状态 0未申请 1待处理 2已处理
			    "reservation_status": 3,//预约状态 1已预约 2待使用 3使用中 4已完成 5已取消
			    "order_time": 1766671601 //订单时间戳
			},
			{
			    "id": 1,
			    "vehicle_name": "飞车21111", //车辆名称
			    "vehicle_id": 12, 
			    "order_no": "aaacasd13213121", //预约号
			    "billing_method": 0, //计费方式 0按时间 1按次
			    "venue_id": 1,  
			    "venue_name": "测试", //场地名称
			    "appeal_status": 0, //申诉状态 0未申请 1待处理 2已处理
			    "reservation_status": 4,//预约状态 1已预约 2待使用 3使用中 4已完成 5已取消
			    "order_time": 1766671601 //订单时间戳
			},
			{
			    "id": 1,
			    "vehicle_name": "飞车21111", //车辆名称
			    "vehicle_id": 12, 
			    "order_no": "aaacasd13213121", //预约号
			    "billing_method": 0, //计费方式 0按时间 1按次
			    "venue_id": 1,  
			    "venue_name": "测试", //场地名称
			    "appeal_status": 0, //申诉状态 0未申请 1待处理 2已处理
			    "reservation_status": 5,//预约状态 1已预约 2待使用 3使用中 4已完成 5已取消
			    "order_time": 1766671601 //订单时间戳
			}
        ]
    },
    "traceId": "69576de30dc49"
}
// 申诉
export const complainList = 
{
    "code": 200,
    "msg": "",
    "data": {
        "page": 1,
        "size": 10,
        "total": 1,
        "isLast": 1,
        "content": [
            {
                "id": 1,
                "uid": 9,
                "order_no": "aaacasd13213121", //预约号
                "venue_id": 1, 
                "venue_name": "测试", //场地名称
                "billing_method": 0, //计费方式 0按时间 1按次
                "appeal_status": 2,//申诉状态 0未申请 1待处理 2已处理
                "time": 1766747094 //时间
            }
        ]
    },
    "traceId": "6957739670dc3"
}

// 驾驶记录
export const drivingRecord = 
{
    "code": 200,
    "msg": "",
    "data": {
        "page": 1,
        "size": 10,
        "total": 1,
        "isLast": 1,
        "content": [
            {
                "id": 1,
                "user_name": "大笆斗", //用户名称
                "vehicle_name": "飞车21111",//车辆名称
                "vehicle_id": 12,
                "order_no": "aaacasd13213121", //预约号
                "billing_method": 0, //计费方式 0按时间 1按次
                "venue_id": 1,
                "venue_name": "测试", //场地名称
                "payment_amount": 8, //金额｜能量｜电池
                "appeal_status": 0,//申诉状态 0未申请 1待处理 2已处理
                "reservation_status": 3, //状态 1已预约 2待使用 3使用中 4已完成 5已取消
                "order_time": 1766671601, //订单时间
                "start_time": 1766671612, //开始时间
                "end_time": 1766671618 //结束时间
            }
        ]
    },
    "traceId": "6957749854023"
}

