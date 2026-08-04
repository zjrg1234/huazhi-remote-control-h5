export const reservationStatus = (type) => {
	
	return {
		1:"已预约", 
		2:"待使用", 
		3:"使用中", 
		4:"已完成", 
		5:"已取消"
	}[type]
		
}

export const billingMethod = (type) => {

	return {
		1:"按次计费",
		0:"按时间计费"
	}[type]
		
}


export const paymentType = (type) => {

	return {
		1:"电池",
		2:"能量"
	}[type]
		
}
