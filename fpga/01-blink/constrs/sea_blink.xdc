# 约束告诉 Vivado：Verilog 里的 clk、led 接到芯片的哪只脚，时钟有多快。
# 脚位来自原理图，不是猜的。改错脚位会把信号送到别的器件上。

# 板载振荡器 X2，料号 O3225100MEDA4SC，输出 100 MHz。
# 原理图网络 SYSCLK：X2 的 OUT 经过电阻 R16，到达 FPGA 的 IO_L13P_T2_MRCC_34，封装脚是 H4。
set_property -dict {PACKAGE_PIN H4 IOSTANDARD LVCMOS33} [get_ports clk]
# PACKAGE_PIN H4：clk 这根线焊到 H4。IOSTANDARD LVCMOS33：这个脚按 3.3 V 的普通数字电平驱动。

create_clock -add -name sys_clk_pin -period 10.00 -waveform {0 5} [get_ports clk]
# 告诉时序分析：clk 每 10.00 纳秒一个周期，也就是 100 MHz。波形在 0 纳秒变高，5 纳秒变低，占空比一半。

# 用户灯。原理图网络 FPGA_LED1：FPGA 的 IO_L15N_T2_DQS_34，封装脚 J1，接到绿色灯 D18 的阳极。
# 板上丝印 L1 就是这一路。高电平点亮。红色灯 D19 是 FPGA_LED2，封装脚 A13，这个实验不接。
set_property -dict {PACKAGE_PIN J1 IOSTANDARD LVCMOS33} [get_ports led]
# PACKAGE_PIN J1：led 接到 J1。电平同样是 3.3 V CMOS。
