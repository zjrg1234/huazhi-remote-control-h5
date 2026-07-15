// MARK: -- 四向 - 操控盘控制 - 代理
extension DriveViewController: MoveFourDirectionControlProtocol {
            func moveFourDirectionControlPosition(_ view: MoveFourControlPanelView, 
_ positionType: MoveDirectionControlType, _ xRatioValue: CGFloat, _
yRatioValue: Double) {
                        if view == self.controlView.leftFourControlView {
                                    // DDLog("leftFourControlView - 操控盘控制  - 代理回调接收")
                                    // // DDLog(positionType.rawValue)
                                    // // DDLog(xValue)
                                    // // DDLog(yValue)
                                    // // DDLog(view)
                                    if self.driverViewModel.carType == .excavatorHydraulic ||
                                                self.driverViewModel.carType == .excavatorGeneral ||
                                                self.driverViewModel.carType == .excavatorHammer ||
                                                self.driverViewModel.carType == .excavatorPaw {
                                                self.handleFourControlChannel(true, positionType, 
xRatioValue, yRatioValue)
                                    }
                        }else if view == self.controlView.rightFourControlView {
                                    // DDLog("rightFourControlView - 操控盘控制  - 代理回调接收")
                                    // // DDLog(positionType.rawValue)
                                    // // DDLog(xValue)
                                    // // DDLog(yValue)
                                    // // DDLog(view)
                                    if self.driverViewModel.carType == .excavatorHydraulic ||
                                                self.driverViewModel.carType == .excavatorGeneral ||
                                                self.driverViewModel.carType == .excavatorHammer ||
                                                self.driverViewModel.carType == .excavatorPaw {
                                                self.handleFourControlChannel(false, positionType, 
xRatioValue, yRatioValue)
                                    }
                        }
            }
            func handleFourControlChannel(_ isLeftPanel:Bool, _ positionType: 
MoveDirectionControlType, _ xRatioValue: CGFloat, _ yRatioValue: Double){
                        // 液压挖机油泵、普通挖机灯光:CH7
                        if isLeftPanel == true {
                                    // 左侧操控盘:旋转：CH3、小臂 CH5
                                    // DDLog("leftFourControlView - 左侧操控盘  - 代理回调
接收")
                                    let channel3SetItemVM = 
self.getChannelSetItemViewModel(index: 2)// 旋转
                                    let channel5SetItemVM = 
self.getChannelSetItemViewModel(index: 4)// 小臂
                                    let channel7SetItemVM = 
self.getChannelSetItemViewModel(index: 6) // 液压挖机油泵、普通挖机灯光
                                    let ch3OpenValue = 
CGFloat(channel3SetItemVM?.openVM?.defaultMinimum ?? 1)// 旋转开值
                                    let ch3CenterValue = 
CGFloat(channel3SetItemVM?.centerVM?.defaultMinimum ?? 1)// 旋转中位值
                                    let ch3CloseValue = 
CGFloat(channel3SetItemVM?.closeVM?.defaultMinimum ?? 1)// 旋转关值
                                    let ch5OpenValue = 
CGFloat(channel5SetItemVM?.openVM?.defaultMinimum ?? 1)// 小臂开值
                                    let ch5CenterValue = 
CGFloat(channel5SetItemVM?.centerVM?.defaultMinimum ?? 1)// 小臂中位值
                                    let ch5CloseValue = 
CGFloat(channel5SetItemVM?.closeVM?.defaultMinimum ?? 1)// 小臂关值
                                    let ch7OpenValue = 
Int(channel7SetItemVM?.openVM?.defaultMinimum ?? 1)//油泵开值
                                    let ch7CloseValue = 
Int(channel7SetItemVM?.closeVM?.defaultMinimum ?? 1)//油泵关值
                                    if positionType == .endType {
                                                self.channelS3 = Int(ch3CenterValue)// 恢复旋转中位值
                                                self.channelS5 = Int(ch5CenterValue)// 恢复小臂中位值
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机
                                                            if self.driverViewModel.otherSetVM?.mixControlState
== true { //油泵混控状态  - 打开
                                                                        // 油泵  - 使用时开启，不使用时关闭
                                                                        if ch7OpenValue > ch7CloseValue {
                                                                                    self.channelS7 = ch7CloseValue
                                                                        }else {
                                                                                    self.channelS7 = ch7OpenValue
                                                                        }
                                                            }else {
                                                                        // 油泵常开  - 传大值
                                                                        if ch7OpenValue > ch7CloseValue {
                                                                                    self.channelS7 = ch7OpenValue
                                                                        }else {
                                                                                    self.channelS7 = ch7CloseValue
                                                                        }
                                                            }
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
// self.channelS7 = ch7CloseValue
                                                }
// DDLog("左侧操控结束  -")
// DDLog("self.channelS4:\(self.channelS4)")
// DDLog("self.channelS6:\(self.channelS6)")
// DDLog("self.channelS7:\(self.channelS7)")
                                    }else if positionType == .leftType {// ← 左
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机  - 左转向不需要油泵，所以此处是关闭
                                                            if self.driverViewModel.otherSetVM?.mixControlState
== true {//油泵混控状态  - 打开
                                                                        // 油泵  - 使用时开启，不使用时关闭
                                                                        if ch7OpenValue > ch7CloseValue {
                                                                                    self.channelS7 = ch7CloseValue
                                                                        }else {
                                                                                    self.channelS7 = ch7OpenValue
                                                                        }
                                                            }else {
                                                                        //油泵混控状态  - 关闭，当右侧操控盘无操作时，关
闭油泵
                                                                        if self.driverViewModel.oilRightPanelUseState == 
false {
                                                                                    // 当液压挖机右侧操控盘不在控制时，关闭液
压
                                                                                    if ch7OpenValue > ch7CloseValue {
                                                                                                self.channelS7 = ch7CloseValue
                                                                                    }else {
                                                                                                self.channelS7 = ch7OpenValue
                                                                                    }
                                                                        }
                                                            }
                                                            if
self.driverViewModel.otherSetVM?.reverseRotationState == true {
                                                                        // 开起了旋转反向  - 变右旋
                                                                        let ch3SendValue = ch3CenterValue - 
(ch3CenterValue - ch3CloseValue) * xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }else {
                                                                        // 左旋
                                                                        let ch3SendValue = ch3CenterValue + 
(ch3OpenValue - ch3CenterValue) * xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }
                                                            self.channelS5 = Int(ch5CenterValue)
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            if
self.driverViewModel.otherSetVM?.reverseRotationState == true {
                                                                        // 开起了旋转反向  - 变右旋
// let ch3SendValue = ch3CloseValue //* xRatioValue
                                                                        let ch3SendValue = ch3OpenValue //* 
xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                                        DDLog("ch3SendValue\(ch3SendValue)")
                                                            }else {
                                                                        // 左旋
// let ch3SendValue = ch3OpenValue //* xRatioValue
                                                                        let ch3SendValue = ch3CloseValue //* 
xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }
                                                            self.channelS5 = Int(ch5CenterValue)
                                                }
                                    }else if positionType == .leftUpType {// ← ↑ 左上
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机  - 小臂 CH5 - 上抬  需要开油泵
                                                            if ch7OpenValue > ch7CloseValue {
                                                                        self.channelS7 = ch7OpenValue
                                                            }else {
                                                                        self.channelS7 = ch7CloseValue
                                                            }
                                                            // 小臂 CH5 - 上抬
                                                            let ch5SendValue = ch5CenterValue + (ch5OpenValue -
ch5CenterValue) * yRatioValue
                                                            self.channelS5 = Int(ch5SendValue)
                                                            if
self.driverViewModel.otherSetVM?.reverseRotationState == true {
                                                                        // 开起了旋转反向  - 变右旋
                                                                        let ch3SendValue = ch3CenterValue - 
(ch3CenterValue - ch3CloseValue) * xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }else {
                                                                        // 左旋
                                                                        let ch3SendValue = ch3CenterValue + 
(ch3OpenValue - ch3CenterValue) * xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            // 小臂 CH5 - 上抬
                                                            let ch5SendValue = ch5OpenValue //* yRatioValue
                                                            self.channelS5 = Int(ch5SendValue)
                                                            if
self.driverViewModel.otherSetVM?.reverseRotationState == true {
                                                                        // 开起了旋转反向  - 变右旋
// let ch3SendValue = ch3CloseValue //* xRatioValue
                                                                        let ch3SendValue = ch3OpenValue //* 
xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }else {
                                                                        // 左旋
// let ch3SendValue = ch3OpenValue //* xRatioValue
                                                                        let ch3SendValue = ch3CloseValue //* 
xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }
                                                }
                                    }else if positionType == .upType {// ↑ 上
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机  - 小臂 CH5 - 上抬  需要开油泵
                                                            if ch7OpenValue > ch7CloseValue {
                                                                        self.channelS7 = ch7OpenValue
                                                            }else {
                                                                        self.channelS7 = ch7CloseValue
                                                            }
                                                            // 小臂 CH5 - 上抬
                                                            let ch5SendValue = ch5CenterValue + (ch5OpenValue -
ch5CenterValue) * yRatioValue
                                                            self.channelS5 = Int(ch5SendValue)
                                                            self.channelS3 = Int(ch3CenterValue)
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            // 小臂 CH5 - 上抬
                                                            let ch5SendValue = ch5OpenValue //* yRatioValue
                                                            self.channelS5 = Int(ch5SendValue)
                                                            self.channelS3 = Int(ch3CenterValue)
                                                }
                                    }else if positionType == .rightUpType {// → ↑ 右上
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机  - 小臂 CH5 - 上抬  需要开油泵
                                                            if ch7OpenValue > ch7CloseValue {
                                                                        self.channelS7 = ch7OpenValue
                                                            }else {
                                                                        self.channelS7 = ch7CloseValue
                                                            }
                                                            // 小臂 CH5 - 上抬
                                                            let ch5SendValue = ch5CenterValue + (ch5OpenValue -
ch5CenterValue) * yRatioValue
                                                            self.channelS5 = Int(ch5SendValue)
                                                            if
self.driverViewModel.otherSetVM?.reverseRotationState == true {
                                                                        // 开起了旋转反向  - 变左旋
                                                                        let ch3SendValue = ch3CenterValue + 
(ch3OpenValue - ch3CenterValue) * xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }else {
                                                                        // 右旋
                                                                        let ch3SendValue = ch3CenterValue - 
(ch3CenterValue - ch3CloseValue) * xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            // 小臂 CH5 - 上抬
                                                            let ch5SendValue = ch5OpenValue //* yRatioValue
                                                            self.channelS5 = Int(ch5SendValue)
                                                            if
self.driverViewModel.otherSetVM?.reverseRotationState == true {
                                                                        // 开起了旋转反向  - 变左旋
// let ch3SendValue = ch3OpenValue //* xRatioValue
                                                                        let ch3SendValue = ch3CloseValue //* 
xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }else {
                                                                        // 右旋
// let ch3SendValue = ch3CloseValue //* xRatioValue
                                                                        let ch3SendValue = ch3OpenValue //* xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }
                                                }
                                    }else if positionType == .rightType {// → 右
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机  - 右转向不需要油泵，所以此处是关闭
                                                            if self.driverViewModel.otherSetVM?.mixControlState
== true {//油泵混控状态  - 打开
                                                                        // 油泵  - 使用时开启，不使用时关闭
                                                                        if ch7OpenValue > ch7CloseValue {
                                                                                    self.channelS7 = ch7CloseValue
                                                                        }else {
                                                                                    self.channelS7 = ch7OpenValue
                                                                        }
                                                            }else {
                                                                        // 使用时开启，不使用时关闭
                                                                        if self.driverViewModel.oilRightPanelUseState == 
false {
                                                                                    // 当液压挖机右侧操控盘不在控制时，关闭液
压
                                                                                    if ch7OpenValue > ch7CloseValue {
                                                                                                self.channelS7 = ch7CloseValue
                                                                                    }else {
                                                                                                self.channelS7 = ch7OpenValue
                                                                                    }
                                                                        }
                                                            }
                                                            if
self.driverViewModel.otherSetVM?.reverseRotationState == true {
                                                                        // 开起了旋转反向  - 变左旋
                                                                        let ch3SendValue = ch3CenterValue + 
(ch3OpenValue - ch3CenterValue) * xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }else {
                                                                        // 右旋
                                                                        let ch3SendValue = ch3CenterValue - 
(ch3CenterValue - ch3CloseValue) * xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }
                                                            self.channelS5 = Int(ch5CenterValue)
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            if
self.driverViewModel.otherSetVM?.reverseRotationState == true {
                                                                        // 开起了旋转反向  - 变左旋
// let ch3SendValue = ch3OpenValue //* xRatioValue
                                                                        let ch3SendValue = ch3CloseValue //* 
xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }else {
                                                                        // 右旋
// let ch3SendValue = ch3CloseValue //* xRatioValue
                                                                        let ch3SendValue = ch3OpenValue //* xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }
                                                            self.channelS5 = Int(ch5CenterValue)
                                                }
                                    }else if positionType == .rightDownType {// → ↓ 右下
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机  - 小臂 CH5 - 下落  需要开油泵
                                                            if ch7OpenValue > ch7CloseValue {
                                                                        self.channelS7 = ch7OpenValue
                                                            }else {
                                                                        self.channelS7 = ch7CloseValue
                                                            }
                                                            //小臂 CH5 - 下落
                                                            let ch5SendValue = ch5CenterValue - (ch5CenterValue 
- ch5CloseValue) * yRatioValue
                                                            self.channelS5 = Int(ch5SendValue)
                                                            if
self.driverViewModel.otherSetVM?.reverseRotationState == true {
                                                                        // 开起了旋转反向  - 变左旋
                                                                        let ch3SendValue = ch3CenterValue + 
(ch3OpenValue - ch3CenterValue) * xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }else {
                                                                        // 右旋
                                                                        let ch3SendValue = ch3CenterValue - 
(ch3CenterValue - ch3CloseValue) * xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            //小臂 CH5 - 下落
                                                            let ch5SendValue = ch5CloseValue //* yRatioValue
                                                            self.channelS5 = Int(ch5SendValue)
                                                            if
self.driverViewModel.otherSetVM?.reverseRotationState == true {
                                                                        // 开起了旋转反向  - 变左旋
// let ch3SendValue = ch3OpenValue //* xRatioValue
                                                                        let ch3SendValue = ch3CloseValue //* 
xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }else {
                                                                        // 右旋
// let ch3SendValue = ch3CloseValue //* xRatioValue
                                                                        let ch3SendValue = ch3OpenValue //* xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }
                                                }
                                    }else if positionType == .downType {// ↓ 下
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机  - 小臂 CH5 - 下落  需要开油泵
                                                            if ch7OpenValue > ch7CloseValue {
                                                                        self.channelS7 = ch7OpenValue
                                                            }else {
                                                                        self.channelS7 = ch7CloseValue
                                                            }
                                                            //小臂 CH5 - 下落
                                                            let ch5SendValue = ch5CenterValue - (ch5CenterValue 
- ch5CloseValue) * yRatioValue
                                                            self.channelS5 = Int(ch5SendValue)
                                                            self.channelS3 = Int(ch3CenterValue)
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            let ch5SendValue = ch5CloseValue //* yRatioValue
                                                            self.channelS5 = Int(ch5SendValue)
                                                            self.channelS3 = Int(ch3CenterValue)
                                                }
                                    }else if positionType == .leftDownType {// ← ↓ 左下
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机  - 小臂 CH5 - 下落  需要开油泵
                                                            if ch7OpenValue > ch7CloseValue {
                                                                        self.channelS7 = ch7OpenValue
                                                            }else {
                                                                        self.channelS7 = ch7CloseValue
                                                            }
                                                            //小臂 CH5 - 下落
                                                            let ch5SendValue = ch5CenterValue - (ch5CenterValue 
- ch5CloseValue) * yRatioValue
                                                            self.channelS5 = Int(ch5SendValue)
                                                            if
self.driverViewModel.otherSetVM?.reverseRotationState == true {
                                                                        // 开起了旋转反向  - 变右旋
                                                                        let ch3SendValue = ch3CenterValue - 
(ch3CenterValue - ch3CloseValue) * xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }else {
                                                                        // 左旋
                                                                        let ch3SendValue = ch3CenterValue + 
(ch3OpenValue - ch3CenterValue) * xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            //小臂 CH5 - 下落
                                                            let ch5SendValue = ch5CloseValue //* yRatioValue
                                                            self.channelS5 = Int(ch5SendValue)
                                                            if
self.driverViewModel.otherSetVM?.reverseRotationState == true {
                                                                        // 开起了旋转反向  - 变右旋
// let ch3SendValue = ch3CloseValue //* xRatioValue
                                                                        let ch3SendValue = ch3OpenValue //* xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }else {
                                                                        // 左旋
// let ch3SendValue = ch3OpenValue //* xRatioValue
                                                                        let ch3SendValue = ch3CloseValue //* 
xRatioValue
                                                                        self.channelS3 = Int(ch3SendValue)
                                                            }
                                                }
                                    }
                        }else {
                                    // 右侧操控盘:大臂 CH4 + 挖斗 CH6
                                    // DDLog("leftFourControlView - 左侧操控盘  - 代理回调
接收")
                                    let channel4SetItemVM = 
self.getChannelSetItemViewModel(index: 3)// 大臂
                                    let channel6SetItemVM = 
self.getChannelSetItemViewModel(index: 5)// 挖斗
                                    let channel7SetItemVM = 
self.getChannelSetItemViewModel(index: 6) // 油泵
                                    let ch4OpenValue = 
CGFloat(channel4SetItemVM?.openVM?.defaultMinimum ?? 1)// 大臂开值
                                    let ch4CenterValue = 
CGFloat(channel4SetItemVM?.centerVM?.defaultMinimum ?? 1)// 大臂中位值
                                    let ch4CloseValue = 
CGFloat(channel4SetItemVM?.closeVM?.defaultMinimum ?? 1)// 大臂关值
                                    let ch6OpenValue = 
CGFloat(channel6SetItemVM?.openVM?.defaultMinimum ?? 1)// 挖斗开值
                                    let ch6CenterValue = 
CGFloat(channel6SetItemVM?.centerVM?.defaultMinimum ?? 1)// 挖斗中位值
                                    let ch6CloseValue = 
CGFloat(channel6SetItemVM?.closeVM?.defaultMinimum ?? 1)// 挖斗关值
                                    let ch7OpenValue = 
Int(channel7SetItemVM?.openVM?.defaultMinimum ?? 1)//油泵开值
                                    let ch7CloseValue = 
Int(channel7SetItemVM?.closeVM?.defaultMinimum ?? 1)//油泵关值
                                    if self.driverViewModel.carType == .excavatorHydraulic {
                                                self.driverViewModel.oilRightPanelUseState = true
                                                //液压挖机  - 挖斗、大臂都需要开油泵
                                                if ch7OpenValue > ch7CloseValue {
                                                            self.channelS7 = ch7OpenValue
                                                }else {
                                                            self.channelS7 = ch7CloseValue
                                                }
                                    }
                                    if positionType == .endType {
                                                self.driverViewModel.oilRightPanelUseState = false
                                                self.channelS4 = Int(ch4CenterValue)// 恢复大臂中位值
                                                self.channelS6 = Int(ch6CenterValue)// 恢复挖斗中位值
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机
                                                            if self.driverViewModel.otherSetVM?.mixControlState
== true { //油泵混控  - 打开
                                                                        // 此处是关闭油泵逻辑
                                                                        if ch7OpenValue > ch7CloseValue {
                                                                                    self.channelS7 = ch7CloseValue
                                                                        }else {
                                                                                    self.channelS7 = ch7OpenValue
                                                                        }
                                                            }else {
                                                                        // 油泵常开
                                                                        if ch7OpenValue > ch7CloseValue {
                                                                                    self.channelS7 = ch7OpenValue
                                                                        }else {
                                                                                    self.channelS7 = ch7CloseValue
                                                                        }
                                                            }
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
// self.channelS7 = ch7CloseValue
                                                }
// DDLog("右侧操控结束  -")
// DDLog("self.channelS4:\(self.channelS4)")
// DDLog("self.channelS6:\(self.channelS6)")
// DDLog("self.channelS7:\(self.channelS7)")
                                    }else if positionType == .leftType {// ← 左
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机
                                                            // 挖斗下挖  - 左
// let ch6SendValue = ch6CenterValue + (ch6OpenValue - 
ch6CenterValue) * xRatioValue
                                                            let ch6SendValue = ch6CenterValue - (ch6CenterValue 
- ch6CloseValue) * xRatioValue
                                                            self.channelS6 = Int(ch6SendValue)
                                                            self.channelS4 = Int(ch4CenterValue)
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            // 挖斗下挖  - 左
// let ch6SendValue = ch6OpenValue * xRatioValue
                                                            let ch6SendValue = ch6CloseValue //* xRatioValue
                                                            self.channelS6 = Int(ch6SendValue)
                                                            self.channelS4 = Int(ch4CenterValue)
                                                }
                                    }else if positionType == .leftUpType {// ← ↑ 左上
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机
                                                            // 挖斗下挖  - 左
// let ch6SendValue = ch6CenterValue + (ch6OpenValue - 
ch6CenterValue) * xRatioValue
                                                            let ch6SendValue = ch6CenterValue - (ch6CenterValue 
- ch6CloseValue) * xRatioValue
                                                            self.channelS6 = Int(ch6SendValue)
                                                            // 大臂上抬  - 上
                                                            let ch4SendValue = ch4CenterValue + (ch4OpenValue -
ch4CenterValue) * yRatioValue
                                                            self.channelS4 = Int(ch4SendValue)
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            // 挖斗下挖  - 左
// let ch6SendValue = ch6OpenValue * xRatioValue
                                                            let ch6SendValue = ch6CloseValue //* xRatioValue
                                                            self.channelS6 = Int(ch6SendValue)
                                                            // 大臂上抬  - 上
                                                            let ch4SendValue = ch4OpenValue //* yRatioValue
                                                            self.channelS4 = Int(ch4SendValue)
                                                }
                                    }else if positionType == .upType {// ↑ 上
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机
                                                            // 大臂上抬  - 上
                                                            let ch4SendValue = ch4CenterValue + (ch4OpenValue -
ch4CenterValue) * yRatioValue
                                                            self.channelS4 = Int(ch4SendValue)
                                                            self.channelS6 = Int(ch6CenterValue)
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            // 大臂上抬  - 上
                                                            let ch4SendValue = ch4OpenValue //* yRatioValue
                                                            self.channelS4 = Int(ch4SendValue)
                                                            self.channelS6 = Int(ch6CenterValue)
                                                }
                                    }else if positionType == .rightUpType {// → ↑ 右上
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机
                                                            // 大臂上抬  - 上
                                                            let ch4SendValue = ch4CenterValue + (ch4OpenValue -
ch4CenterValue) * yRatioValue
                                                            self.channelS4 = Int(ch4SendValue)
                                                            // 挖斗抬升  - 右
// let ch6SendValue = ch6CenterValue - (ch6CenterValue - 
ch6CloseValue) * xRatioValue
                                                            let ch6SendValue = ch6CenterValue + (ch6OpenValue -
ch6CenterValue) * xRatioValue
                                                            self.channelS6 = Int(ch6SendValue)
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            // 大臂上抬  - 上
                                                            let ch4SendValue = ch4OpenValue //* yRatioValue
                                                            self.channelS4 = Int(ch4SendValue)
                                                            // 挖斗抬升  - 右
// let ch6SendValue = ch6CloseValue * xRatioValue
                                                            let ch6SendValue = ch6OpenValue //* xRatioValue
                                                            self.channelS6 = Int(ch6SendValue)
                                                }
                                    }else if positionType == .rightType {// → 右
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机
                                                            // 挖斗抬升
// let ch6SendValue = ch6CenterValue - (ch6CenterValue - 
ch6CloseValue) * xRatioValue
                                                            let ch6SendValue = ch6CenterValue + (ch6OpenValue -
ch6CenterValue) * xRatioValue
                                                            self.channelS6 = Int(ch6SendValue)
                                                            self.channelS4 = Int(ch4CenterValue)
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            // 挖斗抬升
// let ch6SendValue = ch6CloseValue * xRatioValue
                                                            let ch6SendValue = ch6OpenValue //* xRatioValue
                                                            self.channelS6 = Int(ch6SendValue)
                                                            self.channelS4 = Int(ch4CenterValue)
                                                }
                                    }else if positionType == .rightDownType {// → ↓ 右下
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机
                                                            // 大臂下落  - 下
                                                            let ch4SendValue = ch4CenterValue - (ch4CenterValue 
- ch4CloseValue) * yRatioValue
                                                            self.channelS4 = Int(ch4SendValue)
                                                            // 挖斗抬升  - 右
// let ch6SendValue = ch6CenterValue - (ch6CenterValue - 
ch6CloseValue) * xRatioValue
                                                            let ch6SendValue = ch6CenterValue + (ch6OpenValue -
ch6CenterValue) * xRatioValue
                                                            self.channelS6 = Int(ch6SendValue)
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            // 大臂下落  - 下
                                                            let ch4SendValue = ch4CloseValue //* yRatioValue
                                                            self.channelS4 = Int(ch4SendValue)
                                                            // 挖斗抬升  - 右
// let ch6SendValue = ch6CloseValue * xRatioValue
                                                            let ch6SendValue = ch6OpenValue //* xRatioValue
                                                            self.channelS6 = Int(ch6SendValue)
                                                }
                                    }else if positionType == .downType {// ↓ 下
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机
                                                            // 大臂下落  - 下
                                                            let ch4SendValue = ch4CenterValue - (ch4CenterValue 
- ch4CloseValue) * yRatioValue
                                                            self.channelS4 = Int(ch4SendValue)
                                                            self.channelS6 = Int(ch6CenterValue)
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            // 大臂下落  - 下
                                                            let ch4SendValue = ch4CloseValue //* yRatioValue
                                                            self.channelS4 = Int(ch4SendValue)
                                                            self.channelS6 = Int(ch6CenterValue)
                                                }
                                    }else if positionType == .leftDownType {// ← ↓ 左下
                                                if self.driverViewModel.carType == .excavatorHydraulic {
                                                            // 液压挖机
                                                            // 挖斗下挖  - 左
// let ch6SendValue = ch6CenterValue + (ch6OpenValue - 
ch6CenterValue) * xRatioValue
                                                            let ch6SendValue = ch6CenterValue - (ch6CenterValue 
- ch6CloseValue) * xRatioValue
                                                            self.channelS6 = Int(ch6SendValue)
                                                            // 大臂下落  - 下
                                                            let ch4SendValue = ch4CenterValue - (ch4CenterValue 
- ch4CloseValue) * yRatioValue
                                                            self.channelS4 = Int(ch4SendValue)
                                                }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                                                    self.driverViewModel.carType
== .excavatorHammer ||
                                                                                    self.driverViewModel.carType
== .excavatorPaw{
                                                            // 挖斗下挖  - 左
// let ch6SendValue = ch6OpenValue * xRatioValue
                                                            let ch6SendValue = ch6CloseValue //* xRatioValue
                                                            self.channelS6 = Int(ch6SendValue)
                                                            // 大臂下落  - 下
                                                            let ch4SendValue = ch4CloseValue //* yRatioValue
                                                            self.channelS4 = Int(ch4SendValue)
                                                }
                                    }
                        }
            } }
// MARK: -- 两向 - 操控盘控制 - 代理
extension DriveViewController: MoveTwoDirectionControlProtocol {
            func moveTwoDirectionControlPosition(_ view: MoveTwoControlPanelView, _
positionType: MoveDirectionControlType, _ ratioValue: Double) {
                        // ratioValue = 油门打开程度比例
                        if view == self.controlView.leftTwoControlView {
                                    // DDLog("leftControlView - 上下  - 操控盘控制  - 代理回调接收")
                                    self.handleTwoDirectionControlChannel(true, positionType, 
ratioValue)
                                    // DDLog("channelS2 的值  -- :\(self.channelS2)")
                        }else if view == self.controlView.rightTwoControlView {
                                    // DDLog("rightTwoControlView - 左右  - 操控盘控制  - 代理回调接
收")
                                    self.handleTwoDirectionControlChannel(false, positionType, 
ratioValue)
                                    // DDLog("channelS1 的值  -- :\(self.channelS1)")
                        }
            }
            // 处理两向操作盘通道值
            func handleTwoDirectionControlChannel(_ isUpDown:Bool, _ positionType: 
MoveDirectionControlType, _ ratioValue: Double){
                        // DDLog(positionType.rawValue)
                        // DDLog(xValue)
                        // DDLog(yValue)
                        var maxValue:Double = 0.0 // 最大值(油门、方向)
                        var centerValue:Double = 0.0 // 中位值(油门、方向)
                        var minValue:Double = 0.0 // 最小值(油门、方向)
                        var rateValue:Double = 0.0 // 力度比例(油门、方向)
                        if isUpDown == true {
                                    // DDLog("leftControlView - 上下  - 操控盘控制")
                                    // 触发方向时，回收定速 UI
                                    if self.isOpenConstantSpeedFalg == true {
                                                if let constantSpeedSetVM = 
self.getSetMenuViewModel(type: CarSetMenuType.constantSpeed) {
                                                            constantSpeedSetVM.isSelected = false
                                                            self.isOpenConstantSpeedFalg = 
constantSpeedSetVM.isSelected
                                                           
self.controlView.configureData(dataVM:self.driverViewModel)
                                                            self.channelS2 = 
Int(self.getCenterTrimmingVMViewModel(index: 1)?.defaultMinimum ?? 1.0)
                                                }
                                    }
                                    maxValue = self.getCenterTrimmingVMViewModel(index: 
1)?.maxValue ?? 1.0
                                    centerValue = self.getCenterTrimmingVMViewModel(index: 
1)?.defaultMinimum ?? 1.0
                                    minValue = self.getCenterTrimmingVMViewModel(index: 
1)?.minValue ?? 1.0
                                    let acceleratorDynamicsValue = 
self.getCenterTrimmingVMViewModel(index: 3)?.defaultMinimum ?? 1.0 // 油门力
度  - 当前值
                                    let acceleratorDynamicsMaxValue = 
self.getCenterTrimmingVMViewModel(index: 3)?.maxValue ?? 1.0 // 油门力度  - 最
大值
                                    rateValue = acceleratorDynamicsValue / 
acceleratorDynamicsMaxValue // 油门力度比例
// DDLog("油门力度比例：\(rateValue)")
                                    if positionType == .endType {
                                                // DDLog("leftControlView - 上下  - 结束")
                                                self.channelS2 = Int(centerValue)
                                    }else {
                                                if positionType == .upType {
                                                            if
self.driverViewModel.otherSetVM?.reverseUpDownState == true {
                                                                        // DDLog("leftControlView 
- 开启了进退反向操作  - 下")
                                                                        self.channelS2 = Int(centerValue - (500) * 
rateValue * ratioValue)
// self.channelS2 = Int(centerValue - (centerValue - 
minValue) * rateValue * ratioValue)
// if self.channelS2 < Int(minValue) {
// self.channelS2 = Int(minValue)
// }
// if self.channelS2 > Int(centerValue) {
// self.channelS2 = Int(centerValue)
// }
                                                            }else {
                                                                        // DDLog("leftControlView 
- 上")
                                                                        self.channelS2 = Int(centerValue + (500) * 
rateValue * ratioValue)
// self.channelS2 = Int(centerValue + (maxValue - 
centerValue) * rateValue * ratioValue)
// if self.channelS2 < Int(centerValue) {
// self.channelS2 = Int(centerValue)
// }
// if self.channelS2 > Int(maxValue) {
// self.channelS2 = Int(maxValue)
// }
                                                            }
                                                            // DDLog("channelS2 的值  -- :\(self.channelS2)")
                                                }else {
                                                            // DDLog("leftControlView - 下")
                                                            if
self.driverViewModel.otherSetVM?.reverseUpDownState == true {
                                                                        // DDLog("leftControlView - 开启了进退反向操作  - 
上")
                                                                        self.channelS2 = Int(centerValue + (500) * 
rateValue * ratioValue)
// self.channelS2 = Int(centerValue + (maxValue - 
centerValue) * rateValue * ratioValue)
// if self.channelS2 < Int(centerValue) {
// self.channelS2 = Int(centerValue)
// }
// if self.channelS2 > Int(maxValue) {
// self.channelS2 = Int(maxValue)
// }
                                                            }else {
                                                                        // DDLog("leftControlView - 下")
                                                                        self.channelS2 = Int(centerValue - (500) * 
rateValue * ratioValue)
// self.channelS2 = Int(centerValue - (centerValue - 
minValue) * rateValue * ratioValue)
// if self.channelS2 < Int(minValue) {
// self.channelS2 = Int(minValue)
// }
// if self.channelS2 > Int(centerValue) {
// self.channelS2 = Int(centerValue)
// }
                                                            }
                                                }
                                                if self.channelS1 < 1 {
                                                            self.channelS1 = 1
                                                }
                                                if self.channelS1 > 2000 {
                                                            self.channelS1 = 2000
                                                }
                                    }
                        }else {
                                    // DDLog("rightTwoControlView - 左右  - 操控盘控制")
                                    maxValue = self.getCenterTrimmingVMViewModel(index: 
0)?.maxValue ?? 1.0
                                    centerValue = self.getCenterTrimmingVMViewModel(index: 
0)?.defaultMinimum ?? 1.0
                                    minValue = self.getCenterTrimmingVMViewModel(index: 
0)?.minValue ?? 1.0
                                    let directionDynamicsValue = 
self.getCenterTrimmingVMViewModel(index: 2)?.defaultMinimum ?? 1.0 // 方向力
度  - 当前值
                                    let directionDynamicsMaxValue = 
self.getCenterTrimmingVMViewModel(index: 2)?.maxValue ?? 1.0 // 方向力度  - 最
大值
                                    rateValue = directionDynamicsValue / 
directionDynamicsMaxValue // 方向力度比例
                                    DDLog("方向力度比例：\(rateValue)")
                                    if positionType == .endType {
                                                // DDLog("rightTwoControlView - 左右  - 结 束")
                                                self.channelS1 = Int(centerValue)
                                    }else {
                                                if positionType == .leftType {
                                                            if
self.driverViewModel.otherSetVM?.reverseLeftRightState == true {
                                                                        //
DDLog("rightTwoControlView - 开启了方向反向操作  - 右")
                                                                        self.channelS1 = Int(centerValue - (500) * 
rateValue * ratioValue)
// if self.channelS1 < Int(minValue) {
// self.channelS1 = Int(minValue)
// }
// if self.channelS1 > Int(centerValue) {
// self.channelS1 = Int(centerValue)
// }
                                                                        if self.channelS1 < 1 {
                                                                                    self.channelS1 = 1
                                                                        }
                                                                        if self.channelS1 > 2000 {
                                                                                    self.channelS1 = 2000
                                                                        }
                                                            }else {
                                                                        //
DDLog("rightTwoControlView - 左")
                                                                        self.channelS1 = Int(centerValue + (500) * 
rateValue * ratioValue)
// if self.channelS1 < Int(centerValue) {
// self.channelS1 = Int(centerValue)
// }
// if self.channelS1 > Int(maxValue) {
// self.channelS1 = Int(maxValue)
// }
                                                                        if self.channelS1 < 1 {
                                                                                    self.channelS1 = 1
                                                                        }
                                                                        if self.channelS1 > 2000 {
                                                                                    self.channelS1 = 2000
                                                                        }
                                                            }
                                                }else {
                                                            if
self.driverViewModel.otherSetVM?.reverseLeftRightState == true {
                                                                        // DDLog("rightTwoControlView - 开启了方向反向
操作  - 左")
                                                                        self.channelS1 = Int(centerValue + (500) * 
rateValue * ratioValue)
// if self.channelS1 < Int(centerValue) {
// self.channelS1 = Int(centerValue)
// }
// if self.channelS1 > Int(maxValue) {
// self.channelS1 = Int(maxValue)
// }
                                                                        if self.channelS1 < 1 {
                                                                                    self.channelS1 = 1
                                                                        }
                                                                        if self.channelS1 > 2000 {
                                                                                    self.channelS1 = 2000
                                                                        }
                                                            }else {
                                                                        // DDLog("rightTwoControlView - 右")
                                                                        self.channelS1 = Int(centerValue - (500) * 
rateValue * ratioValue)
// if self.channelS1 < Int(minValue) {
// self.channelS1 = Int(minValue)
// }
// if self.channelS1 > Int(centerValue) {
// self.channelS1 = Int(centerValue)
// }
                                                                        if self.channelS1 < 1 {
                                                                                    self.channelS1 = 1
                                                                        }
                                                                        if self.channelS1 > 2000 {
                                                                                    self.channelS1 = 2000
                                                                        }
                                                            }
                                                }
                                    }
                        }
            }
}
// MARK: -- 点击盘控制 - 代理
extension DriveViewController: ClickPanelControlProtocol {
            func clickPanelControl(_ view: ClickControlPanelItemView, _ clickStateType: 
ClickPanelControlStateType) {
                        let channel1SetItemVM = self.getChannelSetItemViewModel(index: 0)// 
左轮电机
                        let channel2SetItemVM = self.getChannelSetItemViewModel(index: 1)// 
右轮电机
                        let ch1OpenValue = 
CGFloat(channel1SetItemVM?.openVM?.defaultMinimum ?? 1)// 左轮开值
                        let ch1CenterValue = 
CGFloat(channel1SetItemVM?.centerVM?.defaultMinimum ?? 1)// 左轮中位值
                        let ch1CloseValue = 
CGFloat(channel1SetItemVM?.closeVM?.defaultMinimum ?? 1)// 左轮关值
                        let ch2OpenValue = 
CGFloat(channel2SetItemVM?.openVM?.defaultMinimum ?? 1)// 右轮开值
                        let ch2CenterValue = 
CGFloat(channel2SetItemVM?.centerVM?.defaultMinimum ?? 1)// 右轮中位值
                        let ch2CloseValue = 
CGFloat(channel2SetItemVM?.closeVM?.defaultMinimum ?? 1)// 右轮关值
                        if view == self.controlView.excavatorCenterClickView.leftTopItemView {
                                    // DDLog("leftTopItemView - 点击  - 代理回调接收")
                                    if self.driverViewModel.otherSetVM?.changeUIControlState == 
true {
                                                // 更改了默认控制 UI
                                                if clickStateType == .start {
                                                            DDLog("前进（左右上）  -- 开始")
                                                            if
self.driverViewModel.otherSetVM?.reverseUpDownState == true {
                                                                        // 开启了进退反向  - 后退
                                                                        self.channelS1 = Int(ch1CloseValue)
                                                                        self.channelS2 = Int(ch2CloseValue)
                                                            }else {
                                                                        self.channelS1 = Int(ch1OpenValue)
                                                                        self.channelS2 = Int(ch2OpenValue)
                                                            }
                                                }else {
                                                            DDLog("前进（左右上）  -- 结束")
                                                            self.channelS1 = Int(ch1CenterValue)
                                                            self.channelS2 = Int(ch2CenterValue)
                                                }
                                    }else {
                                                // 没有更改默认控制 UI
                                                if clickStateType == .start {
                                                            DDLog("左前进  -- 开始")
                                                            if
self.driverViewModel.otherSetVM?.reverseUpDownState == true {
                                                                        // 开启了进退反向  - 后退
                                                                        self.channelS1 = Int(ch1CloseValue)
                                                            }else {
                                                                        self.channelS1 = Int(ch1OpenValue)
                                                            }
                                                }else {
                                                            DDLog("左前进  -- 结束")
                                                            self.channelS1 = Int(ch1CenterValue)
                                                }
                                    }
                        }else if view == 
self.controlView.excavatorCenterClickView.leftBottomItemView {
                                    // DDLog("leftBottomItemView - 点击  - 代理回调接收")
                                    // DDLog(clickStateType.rawValue)
                                    if self.driverViewModel.otherSetVM?.changeUIControlState == 
true {
                                                // 更改了默认控制 UI
                                                if clickStateType == .start {
                                                            DDLog("后退（左右下）  -- 开始")
                                                            if
self.driverViewModel.otherSetVM?.reverseUpDownState == true {
                                                                        // 开启了进退反向  - 前进
                                                                        self.channelS1 = Int(ch1OpenValue)
                                                                        self.channelS2 = Int(ch2OpenValue)
                                                            }else {
                                                                        //后退
                                                                        self.channelS1 = Int(ch1CloseValue)
                                                                        self.channelS2 = Int(ch2CloseValue)
                                                            }
                                                }else {
                                                            DDLog("后退（左右下）  -- 结束")
                                                            self.channelS1 = Int(ch1CenterValue)
                                                            self.channelS2 = Int(ch2CenterValue)
                                                }
                                    }else {
                                                // 没有更改默认控制 UI
                                                if clickStateType == .start {
                                                            DDLog("左后退  -- 开始")
                                                            if
self.driverViewModel.otherSetVM?.reverseUpDownState == true {
                                                                        // 开启了进退反向  - 前进
                                                                        self.channelS1 = Int(ch1OpenValue)
                                                            }else {
                                                                        self.channelS1 = Int(ch1CloseValue)
                                                            }
                                                }else {
                                                            DDLog("左下  -- 结束")
                                                            self.channelS1 = Int(ch1CenterValue)
                                                }
                                    }
                        }else if view == 
self.controlView.excavatorCenterClickView.canChangeItemView {
                                    // DDLog("canChangeItemView - 点击  - 代理回调接收")
                                    // DDLog(clickStateType.rawValue)
                                    if self.driverViewModel.otherSetVM?.changeUIControlState == 
true {
                                                // 更改了默认控制 UI
                                                if clickStateType == .start {
                                                            DDLog("左电机前进  -- 开始")
                                                            if
self.driverViewModel.otherSetVM?.reverseUpDownState == true {
                                                                        // 开启了进退反向  - 左电机后退
                                                                        self.channelS1 = Int(ch1CloseValue)
                                                            }else {
                                                                        // 左电机前进
                                                                        self.channelS1 = Int(ch1OpenValue)
                                                            }
                                                }else {
                                                            DDLog("左转弯  -- 结束")
                                                            self.channelS1 = Int(ch1CenterValue)
                                                }
                                    }else {
                                                // 没有更改默认控制 UI
                                                if clickStateType == .start {
                                                            DDLog("右前进  -- 开始")
                                                            if
self.driverViewModel.otherSetVM?.reverseUpDownState == true {
                                                                        // 开启了进退反向  - 后退
                                                                        self.channelS2 = Int(ch2CloseValue)
                                                            }else {
                                                                        self.channelS2 = Int(ch2OpenValue)
                                                            }
                                                }else {
                                                            DDLog("右前进  -- 结束")
                                                            self.channelS2 = Int(ch2CenterValue)
                                                }
                                    }
                        }else if view == 
self.controlView.excavatorCenterClickView.rightBottomItemView {
                                    // DDLog("rightBottomItemView - 点击  - 代理回调接收")
                                    // DDLog(clickStateType.rawValue)
                                    if self.driverViewModel.otherSetVM?.changeUIControlState == 
true {
                                                // 更改了默认控制 UI
                                                if clickStateType == .start {
                                                            DDLog("右电机前进  -- 开始")
                                                            if
self.driverViewModel.otherSetVM?.reverseUpDownState == true {
                                                                        // 开启了进退反向  - 右电机后退
                                                                        self.channelS2 = Int(ch2CloseValue)
                                                            }else {
                                                                        // 右电机前进
                                                                        self.channelS2 = Int(ch2OpenValue)
                                                            }
                                                }else {
                                                            DDLog("右电机前进  -- 结束")
                                                            self.channelS2 = Int(ch2CenterValue)
                                                }
                                    }else {
                                                // 没有更改默认控制 UI
                                                if clickStateType == .start {
                                                            DDLog("右后退  -- 开始")
                                                            if
self.driverViewModel.otherSetVM?.reverseUpDownState == true {
                                                                        // 开启了进退反向  - 后退
                                                                        self.channelS2 = Int(ch2OpenValue)
                                    rateValue = (acceleratorDynamicsValue / 
acceleratorDynamicsMaxValue) * (selectedMinimum / selectedMaxValue) // 油门力
度比例  * 定速值比例
                                    if self.driverViewModel.otherSetVM?.reverseUpDownState == true
{
                                                // DDLog("leftControlView - 开启了进
退反向操作  - 下")
                                                self.channelS2 = Int(centerValue - (centerValue - minValue) *
rateValue)
                                                if self.channelS2 < Int(minValue) {
                                                            self.channelS2 = Int(minValue)
                                                }
                                                if self.channelS2 > Int(centerValue) {
                                                            self.channelS2 = Int(centerValue)
                                                }
                                    }else {
                                                // DDLog("leftControlView - 开启了进
退反向操作  - 上")
                                                self.channelS2 = Int(centerValue + (maxValue - centerValue) 
* rateValue)
                                                if self.channelS2 < Int(centerValue) {
                                                            self.channelS2 = Int(centerValue)
                                                }
                                                if self.channelS2 > Int(maxValue) {
                                                            self.channelS2 = Int(maxValue)
                                                }
                                    }
                                    DDLog("定速巡航  channelS2 的值  -- :\(self.channelS2)")
                        }
            } }
            // 重置通道发送数据(打开和关闭设置页面时)
            func resetChannelSData(){
                        //恢复中位值
                        if self.driverViewModel.carType == .fourWheel {
                                    // 遥控车  - CH1、CH2
                                    let defaultMinimumValueCh1 = 
self.getCenterTrimmingVMViewModel(index: 0)?.defaultMinimum ?? 1.0
                                    let defaultMinimumValueCh2 = 
self.getCenterTrimmingVMViewModel(index: 1)?.defaultMinimum ?? 1.0
                                    self.getCenterTrimmingVMViewModel(index: 
0)?.selectedMinimum = defaultMinimumValueCh1
                                    self.getCenterTrimmingVMViewModel(index: 
1)?.selectedMinimum = defaultMinimumValueCh2
                                    self.channelS1 = Int(defaultMinimumValueCh1)
                                    self.channelS2 = Int(defaultMinimumValueCh2)
                                    let channel3SetItemVM = 
self.getChannelSetItemViewModel(index: 0)// CH3
                                    let channel4SetItemVM = 
self.getChannelSetItemViewModel(index: 1)// CH4
                                    let channel5SetItemVM = 
self.getChannelSetItemViewModel(index: 2)// CH5
                                    let channel6SetItemVM = 
self.getChannelSetItemViewModel(index: 3)// CH6
                                    let channel7SetItemVM = 
self.getChannelSetItemViewModel(index: 4)// CH7
                                    let channel8SetItemVM = 
self.getChannelSetItemViewModel(index: 5)// CH8
                                    let ch3CloseValue = 
Int(channel3SetItemVM?.closeVM?.defaultMinimum ?? 1)// CH3 关值
                                    let ch4CloseValue = 
Int(channel4SetItemVM?.closeVM?.defaultMinimum ?? 1)// CH4 关值
                                    let ch5CloseValue = 
Int(channel5SetItemVM?.closeVM?.defaultMinimum ?? 1)// CH5 关值
                                    let ch6CloseValue = 
Int(channel6SetItemVM?.closeVM?.defaultMinimum ?? 1)// CH6 关值
                                    let ch7CloseValue = 
Int(channel7SetItemVM?.closeVM?.defaultMinimum ?? 1)// CH7 关值
                                    let ch8CloseValue = 
Int(channel8SetItemVM?.closeVM?.defaultMinimum ?? 1)// CH8 关值
                                    self.channelS3 = ch3CloseValue
                                    self.channelS4 = ch4CloseValue
                                    self.channelS5 = ch5CloseValue
                                    self.channelS6 = ch6CloseValue
                                    self.channelS7 = ch7CloseValue
                                    self.channelS8 = ch8CloseValue
                        }else if self.driverViewModel.carType == .excavatorGeneral ||
                                                            self.driverViewModel.carType == .excavatorHammer ||
                                                            self.driverViewModel.carType == .excavatorPaw {
                                    // 未保存  - 恢复成默认本地 ViewModel 的选中值
                                    self.handleSaveFaildChannelSData()
                                    let channel1SetItemVM = 
self.getChannelSetItemViewModel(index: 0)// 左轮电机
                                    let channel2SetItemVM = 
self.getChannelSetItemViewModel(index: 1)// 右轮电机
                                    let channel3SetItemVM = 
self.getChannelSetItemViewModel(index: 2)// 旋转
                                    let channel4SetItemVM = 
self.getChannelSetItemViewModel(index: 3)// 大臂
                                    let channel5SetItemVM = 
self.getChannelSetItemViewModel(index: 4)// 小臂
                                    let channel6SetItemVM = 
self.getChannelSetItemViewModel(index: 5)// 挖斗
                                    let channel7SetItemVM = 
self.getChannelSetItemViewModel(index: 6)// 液压
                                    let channel8SetItemVM = 
self.getChannelSetItemViewModel(index: 7)// 灯光
                                    self.channelS1 = 
Int(channel1SetItemVM?.centerVM?.defaultMinimum ?? 1)// 左轮中位值
                                    self.channelS2 = 
Int(channel2SetItemVM?.centerVM?.defaultMinimum ?? 1)// 右轮中位值
                                    self.channelS3 = 
Int(channel3SetItemVM?.centerVM?.defaultMinimum ?? 1)// 旋转中位值
                                    self.channelS4 = 
Int(channel4SetItemVM?.centerVM?.defaultMinimum ?? 1)// 大臂中位值
                                    self.channelS5 = 
Int(channel5SetItemVM?.centerVM?.defaultMinimum ?? 1)// 小臂中位值
                                    self.channelS6 = 
Int(channel6SetItemVM?.centerVM?.defaultMinimum ?? 1)// 挖斗中位值
                                    let ch7OpenValue = 
Int(channel7SetItemVM?.openVM?.defaultMinimum ?? 1)//灯光开值
                                    let ch7CloseValue = 
Int(channel7SetItemVM?.closeVM?.defaultMinimum ?? 1)//灯光关值
                                    let ch8OpenValue = 
Int(channel8SetItemVM?.openVM?.defaultMinimum ?? 1)//CH8 开值
                                    let ch8CloseValue = 
Int(channel8SetItemVM?.closeVM?.defaultMinimum ?? 1)//CH8 关值
                                    // 灯光关闭  - 为小值
                                    var ch7Value = ch7OpenValue
                                    if ch7OpenValue > ch7CloseValue {
                                                ch7Value = ch7CloseValue
                                    }
                                    self.channelS7 = ch7Value// 为关闭的值
                                    //CH8 关闭
                                    var ch8Value = ch8OpenValue
                                    if ch8OpenValue > ch8CloseValue {
                                                ch8Value = ch8CloseValue
                                    }
                                    self.channelS8 = ch8Value //为关闭的值
                        }else if self.driverViewModel.carType == .excavatorHydraulic {
                                    // 未保存  - 恢复成默认本地 ViewModel 的选中值
                                    self.handleSaveFaildChannelSData()
                                    let channel1SetItemVM = 
self.getChannelSetItemViewModel(index: 0)// 左轮电机
                                    let channel2SetItemVM = 
self.getChannelSetItemViewModel(index: 1)// 右轮电机
                                    let channel3SetItemVM = 
self.getChannelSetItemViewModel(index: 2)// 旋转
                                    let channel4SetItemVM = 
self.getChannelSetItemViewModel(index: 3)// 大臂
                                    let channel5SetItemVM = 
self.getChannelSetItemViewModel(index: 4)// 小臂
                                    let channel6SetItemVM = 
self.getChannelSetItemViewModel(index: 5)// 挖斗
                                    let channel7SetItemVM = 
self.getChannelSetItemViewModel(index: 6)// 液压
                                    let channel8SetItemVM = 
self.getChannelSetItemViewModel(index: 7)// 灯光
                                    self.channelS1 = 
Int(channel1SetItemVM?.centerVM?.defaultMinimum ?? 1)// 左轮中位值
                                    self.channelS2 = 
Int(channel2SetItemVM?.centerVM?.defaultMinimum ?? 1)// 右轮中位值
                                    self.channelS3 = 
Int(channel3SetItemVM?.centerVM?.defaultMinimum ?? 1)// 旋转中位值
                                    self.channelS4 = 
Int(channel4SetItemVM?.centerVM?.defaultMinimum ?? 1)// 大臂中位值
                                    self.channelS5 = 
Int(channel5SetItemVM?.centerVM?.defaultMinimum ?? 1)// 小臂中位值
                                    self.channelS6 = 
Int(channel6SetItemVM?.centerVM?.defaultMinimum ?? 1)// 挖斗中位值
                                    let ch7OpenValue = 
Int(channel7SetItemVM?.openVM?.defaultMinimum ?? 1)//油泵开值
                                    let ch7CloseValue = 
Int(channel7SetItemVM?.closeVM?.defaultMinimum ?? 1)//油泵关值
                                    let ch8OpenValue = 
Int(channel8SetItemVM?.openVM?.defaultMinimum ?? 1)//灯光开值
                                    let ch8CloseValue = 
Int(channel8SetItemVM?.closeVM?.defaultMinimum ?? 1)//灯光关值
                                    // 油泵关闭  - 为小值
                                    var ch7Value = ch7OpenValue
                                    if ch7OpenValue > ch7CloseValue {
                                                ch7Value = ch7CloseValue
                                    }
                                    self.channelS7 = ch7Value// 为关闭的值
                                    if self.driverViewModel.otherSetVM?.mixControlState == false {
                                                // 油泵常开  - 为大值
                                                var ch7Value = ch7OpenValue
                                                if ch7OpenValue < ch7CloseValue {
                                                            ch7Value = ch7CloseValue
                                                }
                                                self.channelS7 = ch7Value
                                    }
                                    //灯光关闭
                                    var ch8Value = ch8OpenValue
                                    if ch8OpenValue > ch8CloseValue {
                                                ch8Value = ch8CloseValue
                                    }
                                    self.channelS8 = ch8Value// 为关闭的值
                        }
            }