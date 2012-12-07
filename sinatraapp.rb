require 'csv'
require 'json'
require 'savon'

require 'sinatra'




disable = '#6666CC'


before do
    content_type 'application/json'
end
get '/check/:id' do |id|
  msv = id.strip
	client = Savon.client("http://10.1.0.237:8082/Services.asmx?wsdl")
	response = client.request(:tinh_trang_sinh_vien) do
		soap.body = {:masinhvien => msv}
	end
	res_hash = response.body.to_hash
	ls = res_hash[:tinh_trang_sinh_vien_response][:tinh_trang_sinh_vien_result][:diffgram][:document_element]
	if (ls != nil) then ls.to_json 
	else 'null' end
end
get '/:id' do |id|
	puts 'request new'
	nodes = []
links = []
tags = {}
sbjs = {}
deps = {}
courses = {}
names = {}
groups = {}
colors = {}
prev = {}
status = {}
diem = {}
replace = {}


	msv = id.strip
	i = 0
	client = Savon.client("http://10.1.0.237:8082/Services.asmx?wsdl")
	response = client.request(:mon_sinh_vien_da_qua) do
		soap.body = {:masinhvien => msv }
	end
	response2 = client.request(:mon_sinh_vien_no) do
		soap.body = {:masinhvien => msv }
	end
	response_courses = client.request(:khung_chuong_trinh) do
		soap.body = {:masinhvien => msv }
	end
	response_replace = client.request(:mon_thay_the) do
		soap.body = {:masinhvien => msv}
	end
	response_dk = client.request(:dieu_kien_truoc_sau) do
		soap.body = {:masinhvien => msv }
	end
	
	res_hash = response.body.to_hash
	res_hash2 = response2.body.to_hash
	res_hash_courses = response_courses.body.to_hash
	res_hash_replace = response_replace.body.to_hash
	res_hash_dk = response_dk.body.to_hash

	ls = res_hash[:mon_sinh_vien_da_qua_response][:mon_sinh_vien_da_qua_result][:diffgram][:document_element]
	if (ls ) then ls = ls[:mon_sinh_vien_da_qua]
	else 
		puts "error1";
		#return '{"error":"error1"} '
	end
	ls2 = res_hash2[:mon_sinh_vien_no_response][:mon_sinh_vien_no_result][:diffgram][:document_element]
	if (ls2) then ls2 = ls2[:mon_sinh_vien_no]
	else 
		puts "error2";
		#return '{"error":"error2"}' 
	end
	ls_courses = res_hash_courses[:khung_chuong_trinh_response][:khung_chuong_trinh_result][:diffgram][:document_element]
	if (ls_courses) then ls_courses = ls_courses[:khung_chuong_trinh]
	else 
		puts "error3";
		return '{"error":"error3"}' 
	end
	ls_replace = res_hash_replace[:mon_thay_the_response][:mon_thay_the_result][:diffgram][:document_element]
	if (ls_replace) then ls_replace = ls_replace[:mon_thay_the]
	else
		puts "error4"
	end
	ls_dk = res_hash_dk[:dieu_kien_truoc_sau_response][:dieu_kien_truoc_sau_result][:diffgram][:document_element]
	if (ls_dk) then ls_dk = ls_dk[:dieu_kien_truoc_sau]
	else 
		puts "error5";
		return '{"error":"error5"}' 
	end

	ls_courses.each do |item|
		temp = item[:ma_mon_hoc].strip
		sbjs[temp] = 0		
		groups[temp] = 1
		names[temp] = item[:ten_mon_hoc].strip
		colors[temp] = disable
		status[temp] = 0
	end

	ls_dk.each do |item| 		
		mon1 = item[:ma_mon_hoc1].strip
		mon2 = item[:ma_mon_hoc2].strip
		if (!deps[mon1]) then deps[mon1] = Array.new end

		deps[mon1].push(mon2)

		if (sbjs[mon1]) then
			sbjs[mon1] = sbjs[mon1] + 1
		else
			puts "error subject " + mon1
			sbjs[mon1] = 1
		end

		if (sbjs[mon2]) then
			sbjs[mon2] = sbjs[mon2] + 1		
		else
			puts "error subject2: " + mon2
			sbjs[mon2] = 1
		end

		
	end
	ls_dk.each do |item| 
		mon1 = item[:ma_mon_hoc1].strip
		mon2 = item[:ma_mon_hoc2].strip		
		ro(groups, deps, mon1)
		
	end

	pass = '#009966'	
	fail = '#0066CC'
	if (ls ) then
		ls.each do |item|
			colors[item[:ma_mon_hoc].strip] = pass
			status[item[:ma_mon_hoc].strip] = 1
		end
	end
	if (ls2) then 
		ls2.each do |item|
			colors[item[:ma_mon_hoc].strip] = fail
			status[item[:ma_mon_hoc].strip] = 2
		end
	end
	i = 0
	sbjs.each do |k,v|
		if (v > 0) then 		
			courses[k] = i
			i = i + 1		
		end
	end
	
	ls_dk.each do |item| 
		links.push({"source" => courses[item[:ma_mon_hoc1].strip],
					"target" => courses[item[:ma_mon_hoc2].strip]})		
	end

	enable = '#CC33FF'
	colors.each do |k,v|
		if (v == pass or v == fail) and (deps[k]) and (colors[deps[k]] == disable) then
			colors[deps[k]] = enable
		end
	end

	sbjs.each do |k,v|
		if (v > 0) then 			
			nodes.push({"name" => names[k], 
					"group" => groups[k], 
					"color" => colors[k],
					"status" => status[k]})
		end
	end

	tags["nodes"] = nodes
	tags["links"] = links
		
	
	tags.to_json
end
def ro(groups, deps, item)
	if (!deps[item]) then return end	
	deps[item].each do |it|
		groups[it] = [groups[it],groups[item] + 1].max
		ro(groups, deps, it)
	end
	
end

 
 