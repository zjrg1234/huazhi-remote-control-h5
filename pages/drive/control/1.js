// MARK: -- 四向 - 操控盘控制 - 代理
extension DriveViewController: MoveFourDirectionControlProtocol {
    func moveFourDirectionControlPosition(_ view: MoveFourControlPanelView, _ positionType: MoveDirectionControlType, _ xRatioValue: CGFloat, _ yRatioValue: Double) {
        
        if view == self.controlView.leftFourControlView {
            // DDLog("leftFourControlView - 操控盘控制 - 代理回调接收")
            //            // DDLog(positionType.rawValue)
            //            // DDLog(xValue)
            //            // DDLog(yValue)
            //            // DDLog(view)
            
            if self.driverViewModel.carType == .excavatorHydraulic ||
                self.driverViewModel.carType == .excavatorGeneral ||
                self.driverViewModel.carType == .excavatorHammer ||
                self.driverViewModel.carType == .excavatorPaw {
                self.handleFourControlChannel(true, positionType, xRatioValue, yRatioValue)
            }
            
        }else if view == self.controlView.rightFourControlView {
            // DDLog("rightFourControlView - 操控盘控制 - 代理回调接收")
            //            // DDLog(positionType.rawValue)
            //            // DDLog(xValue)
            //            // DDLog(yValue)
            //            // DDLog(view)
            if self.driverViewModel.carType == .excavatorHydraulic ||
                self.driverViewModel.carType == .excavatorGeneral ||
                self.driverViewModel.carType == .excavatorHammer ||
                self.driverViewModel.carType == .excavatorPaw {
                
                self.handleFourControlChannel(false, positionType, xRatioValue, yRatioValue)
            }
        }
    }
    
    func handleFourControlChannel(_ isLeftPanel:Bool, _ positionType: MoveDirectionControlType, _ xRatioValue: CGFloat, _ yRatioValue: Double){
        
        // 液压挖机油泵、普通挖机灯光:CH7
        if isLeftPanel == true {
            // 左侧操控盘:旋转：CH3、小臂CH5
            //            DDLog("leftFourControlView - 左侧操控盘 - 代理回调接收")
            
            let channel3SetItemVM = self.getChannelSetItemViewModel(index: 2)// 旋转
            let channel5SetItemVM = self.getChannelSetItemViewModel(index: 4)// 小臂
            let channel7SetItemVM = self.getChannelSetItemViewModel(index: 6) // 液压挖机油泵、普通挖机灯光
            
            let ch3OpenValue = CGFloat(channel3SetItemVM?.openVM?.defaultMinimum ?? 1)// 旋转开值
            let ch3CenterValue = CGFloat(channel3SetItemVM?.centerVM?.defaultMinimum ?? 1)// 旋转中位值
            let ch3CloseValue = CGFloat(channel3SetItemVM?.closeVM?.defaultMinimum ?? 1)// 旋转关值
            
            let ch5OpenValue = CGFloat(channel5SetItemVM?.openVM?.defaultMinimum ?? 1)// 小臂开值
            let ch5CenterValue = CGFloat(channel5SetItemVM?.centerVM?.defaultMinimum ?? 1)// 小臂中位值
            let ch5CloseValue = CGFloat(channel5SetItemVM?.closeVM?.defaultMinimum ?? 1)// 小臂关值
            
            let ch7OpenValue = Int(channel7SetItemVM?.openVM?.defaultMinimum ?? 1)//油泵开值
            let ch7CloseValue = Int(channel7SetItemVM?.closeVM?.defaultMinimum ?? 1)//油泵关值
            
            if positionType == .endType {
                
                self.channelS3 = Int(ch3CenterValue)// 恢复旋转中位值
                self.channelS5 = Int(ch5CenterValue)// 恢复小臂中位值
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机
                    if self.driverViewModel.otherSetVM?.mixControlState == true { //油泵混控状态 - 打开
                        // 油泵 - 使用时开启，不使用时关闭
                        if ch7OpenValue > ch7CloseValue {
                            self.channelS7 = ch7CloseValue
                        }else {
                            self.channelS7 = ch7OpenValue
                        }
                    }else {
                        // 油泵常开 - 传大值
                        if ch7OpenValue > ch7CloseValue {
                            self.channelS7 = ch7OpenValue
                        }else {
                            self.channelS7 = ch7CloseValue
                        }
                    }
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    
//                    self.channelS7 = ch7CloseValue
                }
                
//                DDLog("左侧操控结束 -")
//                DDLog("self.channelS4:\(self.channelS4)")
//                DDLog("self.channelS6:\(self.channelS6)")
//                DDLog("self.channelS7:\(self.channelS7)")
            }else if positionType == .leftType {// ← 左
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机 - 左转向不需要油泵，所以此处是关闭
                    if self.driverViewModel.otherSetVM?.mixControlState == true {//油泵混控状态 - 打开
                        // 油泵 - 使用时开启，不使用时关闭
                        if ch7OpenValue > ch7CloseValue {
                            self.channelS7 = ch7CloseValue
                        }else {
                            self.channelS7 = ch7OpenValue
                        }
                    }else {
                        //油泵混控状态 - 关闭，当右侧操控盘无操作时，关闭油泵
                        if self.driverViewModel.oilRightPanelUseState == false {
                            // 当液压挖机右侧操控盘不在控制时，关闭液压
                            if ch7OpenValue > ch7CloseValue {
                                self.channelS7 = ch7CloseValue
                            }else {
                                self.channelS7 = ch7OpenValue
                            }
                        }
                    }
                    
                    if self.driverViewModel.otherSetVM?.reverseRotationState == true {
                        // 开起了旋转反向 - 变右旋
                        let ch3SendValue = ch3CenterValue - (ch3CenterValue - ch3CloseValue) * xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }else {
                        // 左旋
                        let ch3SendValue = ch3CenterValue + (ch3OpenValue - ch3CenterValue) * xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }
                    self.channelS5 = Int(ch5CenterValue)
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    
                    if self.driverViewModel.otherSetVM?.reverseRotationState == true {
                        // 开起了旋转反向 - 变右旋
//                        let ch3SendValue =  ch3CloseValue //* xRatioValue
                        let ch3SendValue =  ch3OpenValue //* xRatioValue
                        
                        self.channelS3 = Int(ch3SendValue)
                        DDLog("ch3SendValue\(ch3SendValue)")
                    }else {
                        // 左旋
//                        let ch3SendValue = ch3OpenValue //* xRatioValue
                        let ch3SendValue = ch3CloseValue //* xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }
                    self.channelS5 = Int(ch5CenterValue)
                }
            }else if positionType == .leftUpType {// ← ↑ 左上
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机 - 小臂CH5 - 上抬 需要开油泵
                    if ch7OpenValue > ch7CloseValue {
                        self.channelS7 = ch7OpenValue
                    }else {
                        self.channelS7 = ch7CloseValue
                    }
                    // 小臂CH5 - 上抬
                    let ch5SendValue = ch5CenterValue + (ch5OpenValue - ch5CenterValue) * yRatioValue
                    self.channelS5 = Int(ch5SendValue)
                    
                    if self.driverViewModel.otherSetVM?.reverseRotationState == true {
                        // 开起了旋转反向 - 变右旋
                        let ch3SendValue = ch3CenterValue - (ch3CenterValue - ch3CloseValue) * xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }else {
                        // 左旋
                        let ch3SendValue = ch3CenterValue + (ch3OpenValue - ch3CenterValue) * xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    // 小臂CH5 - 上抬
                    let ch5SendValue = ch5OpenValue //* yRatioValue
                    self.channelS5 = Int(ch5SendValue)
                    
                    if self.driverViewModel.otherSetVM?.reverseRotationState == true {
                        // 开起了旋转反向 - 变右旋
//                        let ch3SendValue =  ch3CloseValue //* xRatioValue
                        let ch3SendValue =  ch3OpenValue //* xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }else {
                        // 左旋
//                        let ch3SendValue = ch3OpenValue //* xRatioValue
                        let ch3SendValue =  ch3CloseValue //* xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }
                }
            }else if positionType == .upType {// ↑ 上
                
                if self.driverViewModel.carType == .excavatorHydraulic {
               
                    // 液压挖机 - 小臂CH5 - 上抬 需要开油泵
                    if ch7OpenValue > ch7CloseValue {
                        self.channelS7 = ch7OpenValue
                    }else {
                        self.channelS7 = ch7CloseValue
                    }
                    // 小臂CH5 - 上抬
                    let ch5SendValue = ch5CenterValue + (ch5OpenValue - ch5CenterValue) * yRatioValue
                    self.channelS5 = Int(ch5SendValue)
                    self.channelS3 = Int(ch3CenterValue)
                    
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    // 小臂CH5 - 上抬
                    let ch5SendValue = ch5OpenValue //* yRatioValue
                    self.channelS5 = Int(ch5SendValue)
                    self.channelS3 = Int(ch3CenterValue)
                }
            }else if positionType == .rightUpType {// → ↑ 右上
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机 - 小臂CH5 - 上抬 需要开油泵
                    if ch7OpenValue > ch7CloseValue {
                        self.channelS7 = ch7OpenValue
                    }else {
                        self.channelS7 = ch7CloseValue
                    }
                    // 小臂CH5 - 上抬
                    let ch5SendValue = ch5CenterValue + (ch5OpenValue - ch5CenterValue) * yRatioValue
                    self.channelS5 = Int(ch5SendValue)
                    if self.driverViewModel.otherSetVM?.reverseRotationState == true {
                        // 开起了旋转反向 - 变左旋
                        let ch3SendValue = ch3CenterValue + (ch3OpenValue - ch3CenterValue) * xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }else {
                        // 右旋
                        let ch3SendValue = ch3CenterValue - (ch3CenterValue - ch3CloseValue) * xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    // 小臂CH5 - 上抬
                    let ch5SendValue = ch5OpenValue //* yRatioValue
                    self.channelS5 = Int(ch5SendValue)
                    
                    if self.driverViewModel.otherSetVM?.reverseRotationState == true {
                        // 开起了旋转反向 - 变左旋
//                        let ch3SendValue = ch3OpenValue //* xRatioValue
                        let ch3SendValue = ch3CloseValue //* xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }else {
                        // 右旋
//                        let ch3SendValue = ch3CloseValue //* xRatioValue
                        let ch3SendValue = ch3OpenValue //* xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }
                }
            }else if positionType == .rightType {// → 右
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机 - 右转向不需要油泵，所以此处是关闭
                    if self.driverViewModel.otherSetVM?.mixControlState == true {//油泵混控状态 - 打开
                        // 油泵 - 使用时开启，不使用时关闭
                        if ch7OpenValue > ch7CloseValue {
                            self.channelS7 = ch7CloseValue
                        }else {
                            self.channelS7 = ch7OpenValue
                        }
                    }else {
                        // 使用时开启，不使用时关闭
                        if self.driverViewModel.oilRightPanelUseState == false {
                            // 当液压挖机右侧操控盘不在控制时，关闭液压
                            if ch7OpenValue > ch7CloseValue {
                                self.channelS7 = ch7CloseValue
                            }else {
                                self.channelS7 = ch7OpenValue
                            }
                        }
                    }
                    if self.driverViewModel.otherSetVM?.reverseRotationState == true {
                        // 开起了旋转反向 - 变左旋
                        let ch3SendValue = ch3CenterValue + (ch3OpenValue - ch3CenterValue) * xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }else {
                        // 右旋
                        let ch3SendValue = ch3CenterValue - (ch3CenterValue - ch3CloseValue) * xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }
                    self.channelS5 = Int(ch5CenterValue)
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    
                    if self.driverViewModel.otherSetVM?.reverseRotationState == true {
                        // 开起了旋转反向 - 变左旋
//                        let ch3SendValue = ch3OpenValue //* xRatioValue
                        let ch3SendValue = ch3CloseValue //* xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }else {
                        // 右旋
//                        let ch3SendValue = ch3CloseValue //* xRatioValue
                        let ch3SendValue = ch3OpenValue //* xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }
                    self.channelS5 = Int(ch5CenterValue)
                }
            }else if positionType == .rightDownType {// → ↓ 右下
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机 - 小臂CH5 - 下落 需要开油泵
                    if ch7OpenValue > ch7CloseValue {
                        self.channelS7 = ch7OpenValue
                    }else {
                        self.channelS7 = ch7CloseValue
                    }
                    //小臂CH5 - 下落
                    let ch5SendValue = ch5CenterValue - (ch5CenterValue - ch5CloseValue) * yRatioValue
                    self.channelS5 = Int(ch5SendValue)
                    if self.driverViewModel.otherSetVM?.reverseRotationState == true {
                        // 开起了旋转反向 - 变左旋
                        let ch3SendValue = ch3CenterValue + (ch3OpenValue - ch3CenterValue) * xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }else {
                        // 右旋
                        let ch3SendValue = ch3CenterValue - (ch3CenterValue - ch3CloseValue) * xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    //小臂CH5 - 下落
                    let ch5SendValue = ch5CloseValue //* yRatioValue
                    self.channelS5 = Int(ch5SendValue)
                    if self.driverViewModel.otherSetVM?.reverseRotationState == true {
                        // 开起了旋转反向 - 变左旋
//                        let ch3SendValue = ch3OpenValue //* xRatioValue
                        let ch3SendValue = ch3CloseValue //* xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }else {
                        // 右旋
//                        let ch3SendValue = ch3CloseValue //* xRatioValue
                        let ch3SendValue = ch3OpenValue //* xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }
                }
            }else if positionType == .downType {// ↓ 下
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机 - 小臂CH5 - 下落 需要开油泵
                    if ch7OpenValue > ch7CloseValue {
                        self.channelS7 = ch7OpenValue
                    }else {
                        self.channelS7 = ch7CloseValue
                    }
                    //小臂CH5 - 下落
                    let ch5SendValue = ch5CenterValue - (ch5CenterValue - ch5CloseValue) * yRatioValue
                    self.channelS5 = Int(ch5SendValue)
                    self.channelS3 = Int(ch3CenterValue)
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    let ch5SendValue = ch5CloseValue //* yRatioValue
                    self.channelS5 = Int(ch5SendValue)
                    self.channelS3 = Int(ch3CenterValue)
                }
            }else if positionType == .leftDownType {// ← ↓ 左下
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机 - 小臂CH5 - 下落 需要开油泵
                    if ch7OpenValue > ch7CloseValue {
                        self.channelS7 = ch7OpenValue
                    }else {
                        self.channelS7 = ch7CloseValue
                    }
                    //小臂CH5 - 下落
                    let ch5SendValue = ch5CenterValue - (ch5CenterValue - ch5CloseValue) * yRatioValue
                    self.channelS5 = Int(ch5SendValue)
                    if self.driverViewModel.otherSetVM?.reverseRotationState == true {
                        // 开起了旋转反向 - 变右旋
                        let ch3SendValue = ch3CenterValue - (ch3CenterValue - ch3CloseValue) * xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }else {
                        // 左旋
                        let ch3SendValue = ch3CenterValue + (ch3OpenValue - ch3CenterValue) * xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    //小臂CH5 - 下落
                    let ch5SendValue = ch5CloseValue //* yRatioValue
                    self.channelS5 = Int(ch5SendValue)
                    if self.driverViewModel.otherSetVM?.reverseRotationState == true {
                        // 开起了旋转反向 - 变右旋
//                        let ch3SendValue = ch3CloseValue //* xRatioValue
                        let ch3SendValue = ch3OpenValue //* xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }else {
                        // 左旋
//                        let ch3SendValue = ch3OpenValue //* xRatioValue
                        let ch3SendValue = ch3CloseValue //* xRatioValue
                        self.channelS3 = Int(ch3SendValue)
                    }
                }
            }
        }else {
            // 右侧操控盘:大臂CH4 + 挖斗CH6
            //            DDLog("leftFourControlView - 左侧操控盘 - 代理回调接收")
            
            let channel4SetItemVM = self.getChannelSetItemViewModel(index: 3)// 大臂
            let channel6SetItemVM = self.getChannelSetItemViewModel(index: 5)// 挖斗
            let channel7SetItemVM = self.getChannelSetItemViewModel(index: 6) // 油泵
            
            let ch4OpenValue = CGFloat(channel4SetItemVM?.openVM?.defaultMinimum ?? 1)// 大臂开值
            let ch4CenterValue = CGFloat(channel4SetItemVM?.centerVM?.defaultMinimum ?? 1)// 大臂中位值
            let ch4CloseValue = CGFloat(channel4SetItemVM?.closeVM?.defaultMinimum ?? 1)// 大臂关值
            
            let ch6OpenValue = CGFloat(channel6SetItemVM?.openVM?.defaultMinimum ?? 1)// 挖斗开值
            let ch6CenterValue = CGFloat(channel6SetItemVM?.centerVM?.defaultMinimum ?? 1)// 挖斗中位值
            let ch6CloseValue = CGFloat(channel6SetItemVM?.closeVM?.defaultMinimum ?? 1)// 挖斗关值
            
            let ch7OpenValue = Int(channel7SetItemVM?.openVM?.defaultMinimum ?? 1)//油泵开值
            let ch7CloseValue = Int(channel7SetItemVM?.closeVM?.defaultMinimum ?? 1)//油泵关值
            
            
            
            if self.driverViewModel.carType == .excavatorHydraulic {
                self.driverViewModel.oilRightPanelUseState = true
                //液压挖机 - 挖斗、大臂都需要开油泵
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
                    if self.driverViewModel.otherSetVM?.mixControlState == true { //油泵混控 - 打开
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
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    
//                    self.channelS7 = ch7CloseValue
                }
                
//                DDLog("右侧操控结束 -")
//                DDLog("self.channelS4:\(self.channelS4)")
//                DDLog("self.channelS6:\(self.channelS6)")
//                DDLog("self.channelS7:\(self.channelS7)")
                
            }else if positionType == .leftType {// ← 左
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机
                    // 挖斗下挖 - 左
//                    let ch6SendValue = ch6CenterValue + (ch6OpenValue - ch6CenterValue) * xRatioValue
                    let ch6SendValue = ch6CenterValue - (ch6CenterValue - ch6CloseValue) * xRatioValue
                    self.channelS6 = Int(ch6SendValue)
                    self.channelS4 = Int(ch4CenterValue)
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    // 挖斗下挖 - 左
//                    let ch6SendValue = ch6OpenValue * xRatioValue
                    let ch6SendValue = ch6CloseValue //* xRatioValue
                    self.channelS6 = Int(ch6SendValue)
                    self.channelS4 = Int(ch4CenterValue)
                    
                }
            }else if positionType == .leftUpType {// ← ↑ 左上
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机
                    // 挖斗下挖 - 左
//                    let ch6SendValue = ch6CenterValue + (ch6OpenValue - ch6CenterValue) * xRatioValue
                    let ch6SendValue = ch6CenterValue - (ch6CenterValue - ch6CloseValue) * xRatioValue
                    self.channelS6 = Int(ch6SendValue)
                    // 大臂上抬 - 上
                    let ch4SendValue = ch4CenterValue + (ch4OpenValue - ch4CenterValue) * yRatioValue
                    self.channelS4 = Int(ch4SendValue)
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    // 挖斗下挖 - 左
//                    let ch6SendValue = ch6OpenValue * xRatioValue
                    let ch6SendValue = ch6CloseValue //* xRatioValue
                    self.channelS6 = Int(ch6SendValue)
                    // 大臂上抬 - 上
                    let ch4SendValue = ch4OpenValue //* yRatioValue
                    self.channelS4 = Int(ch4SendValue)
                }
            }else if positionType == .upType {// ↑ 上
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机
                    // 大臂上抬 - 上
                    let ch4SendValue = ch4CenterValue + (ch4OpenValue - ch4CenterValue) * yRatioValue
                    self.channelS4 = Int(ch4SendValue)
                    self.channelS6 = Int(ch6CenterValue)
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    // 大臂上抬 - 上
                    let ch4SendValue = ch4OpenValue //* yRatioValue
                    self.channelS4 = Int(ch4SendValue)
                    self.channelS6 = Int(ch6CenterValue)
                }
            }else if positionType == .rightUpType {// → ↑ 右上
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机
                    // 大臂上抬 - 上
                    let ch4SendValue = ch4CenterValue + (ch4OpenValue - ch4CenterValue) * yRatioValue
                    self.channelS4 = Int(ch4SendValue)
                    // 挖斗抬升 - 右
//                    let ch6SendValue = ch6CenterValue - (ch6CenterValue - ch6CloseValue) * xRatioValue
                    let ch6SendValue = ch6CenterValue + (ch6OpenValue - ch6CenterValue) * xRatioValue
                    self.channelS6 = Int(ch6SendValue)
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    // 大臂上抬 - 上
                    let ch4SendValue = ch4OpenValue //* yRatioValue
                    self.channelS4 = Int(ch4SendValue)
                    // 挖斗抬升 - 右
//                    let ch6SendValue = ch6CloseValue * xRatioValue
                    let ch6SendValue = ch6OpenValue //* xRatioValue
                    self.channelS6 = Int(ch6SendValue)
                }
            }else if positionType == .rightType {// → 右
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机
                    // 挖斗抬升
//                    let ch6SendValue = ch6CenterValue - (ch6CenterValue - ch6CloseValue) * xRatioValue
                    let ch6SendValue = ch6CenterValue + (ch6OpenValue - ch6CenterValue) * xRatioValue
                    self.channelS6 = Int(ch6SendValue)
                    self.channelS4 = Int(ch4CenterValue)
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    // 挖斗抬升
//                    let ch6SendValue = ch6CloseValue * xRatioValue
                    let ch6SendValue = ch6OpenValue //* xRatioValue
                    self.channelS6 = Int(ch6SendValue)
                    self.channelS4 = Int(ch4CenterValue)
                }
            }else if positionType == .rightDownType {// → ↓ 右下
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机
                    // 大臂下落 - 下
                    let ch4SendValue = ch4CenterValue - (ch4CenterValue - ch4CloseValue) * yRatioValue
                    self.channelS4 = Int(ch4SendValue)
                    // 挖斗抬升 - 右
//                    let ch6SendValue = ch6CenterValue - (ch6CenterValue - ch6CloseValue) * xRatioValue
                    let ch6SendValue = ch6CenterValue + (ch6OpenValue - ch6CenterValue) * xRatioValue
                    self.channelS6 = Int(ch6SendValue)
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    // 大臂下落 - 下
                    let ch4SendValue = ch4CloseValue //* yRatioValue
                    self.channelS4 = Int(ch4SendValue)
                    // 挖斗抬升 - 右
//                    let ch6SendValue = ch6CloseValue * xRatioValue
                    let ch6SendValue = ch6OpenValue //* xRatioValue
                    self.channelS6 = Int(ch6SendValue)
                }
            }else if positionType == .downType {// ↓ 下
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机
                    // 大臂下落 - 下
                    let ch4SendValue = ch4CenterValue - (ch4CenterValue - ch4CloseValue) * yRatioValue
                    self.channelS4 = Int(ch4SendValue)
                    self.channelS6 = Int(ch6CenterValue)
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    // 大臂下落 - 下
                    let ch4SendValue = ch4CloseValue //* yRatioValue
                    self.channelS4 = Int(ch4SendValue)
                    self.channelS6 = Int(ch6CenterValue)
                }
            }else if positionType == .leftDownType {// ← ↓ 左下
                
                if self.driverViewModel.carType == .excavatorHydraulic {
                    // 液压挖机
                    // 挖斗下挖 - 左
//                    let ch6SendValue = ch6CenterValue + (ch6OpenValue - ch6CenterValue) * xRatioValue
                    let ch6SendValue = ch6CenterValue - (ch6CenterValue - ch6CloseValue) * xRatioValue
                    self.channelS6 = Int(ch6SendValue)
                    
                    // 大臂下落 - 下
                    let ch4SendValue = ch4CenterValue - (ch4CenterValue - ch4CloseValue) * yRatioValue
                    self.channelS4 = Int(ch4SendValue)
                }else if self.driverViewModel.carType == .excavatorGeneral ||
                            self.driverViewModel.carType == .excavatorHammer ||
                            self.driverViewModel.carType == .excavatorPaw{
                    // 挖斗下挖 - 左
//                    let ch6SendValue = ch6OpenValue * xRatioValue
                    let ch6SendValue = ch6CloseValue //* xRatioValue
                    self.channelS6 = Int(ch6SendValue)
                    
                    // 大臂下落 - 下
                    let ch4SendValue = ch4CloseValue //* yRatioValue
                    self.channelS4 = Int(ch4SendValue)
                }
            }
        }
    }
}