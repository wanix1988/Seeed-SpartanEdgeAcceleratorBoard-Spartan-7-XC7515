# 板载振荡器 X2，料号 O3225100MEDA4SC，100 MHz。
# 原理图网络 SYSCLK：X2.OUT 经 R16 到 U1 IO_L13P_T2_MRCC_34，封装脚 H4。
set_property -dict {PACKAGE_PIN H4 IOSTANDARD LVCMOS33} [get_ports clk]
create_clock -add -name sys_clk_pin -period 10.00 -waveform {0 5} [get_ports clk]

# 用户灯。原理图网络 FPGA_LED1：U1 IO_L15N_T2_DQS_34，封装脚 J1，接到绿色 LED D18 阳极。
# 板上丝印 L1 对这一路。另一颗红色 D19 是 FPGA_LED2，封装脚 A13，本实验不用。
set_property -dict {PACKAGE_PIN J1 IOSTANDARD LVCMOS33} [get_ports led]
