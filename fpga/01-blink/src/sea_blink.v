`timescale 1ns / 1ps

// 入门实验 01：用板载 100 MHz 时钟翻转用户灯。
// div[24] 每 2^24 个时钟翻转一次，输出周期是 2^25 个时钟，约 3 Hz。
module sea_blink (
  input  wire clk,
  output reg  led
);
  reg [24:0] div;
  always @(posedge clk) begin
    div <= div + 1'b1;
    led <= div[24];
  end
endmodule
