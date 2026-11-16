set origin [file dirname [file normalize [info script]]]
create_project sea_blink [file join $origin sea_blink] -part xc7s15ftgb196-1 -force
set_property target_language Verilog [current_project]
add_files [file join $origin src sea_blink.v]
add_files -fileset constrs_1 [file join $origin constrs sea_blink.xdc]
set_property top sea_blink [current_fileset]
update_compile_order -fileset sources_1
close_project
