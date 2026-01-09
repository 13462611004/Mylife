// 级联选择功能 - 省市区三级联动

document.addEventListener('DOMContentLoaded', function() {
    console.log('级联选择脚本已加载');
    
    // 获取省份、城市、区县的选择框
    const provinceSelect = document.getElementById('id_province_obj');
    const citySelect = document.getElementById('id_city_obj');
    const districtSelect = document.getElementById('id_district_obj');
    
    console.log('省份选择框:', provinceSelect);
    console.log('城市选择框:', citySelect);
    console.log('区县选择框:', districtSelect);
    
    if (!provinceSelect || !citySelect) {
        console.log('级联选择元素未找到，请检查HTML结构');
        return;
    }
    
    // 存储初始值
    const initialCity = citySelect.value;
    const initialDistrict = districtSelect ? districtSelect.value : '';
    
    // 监听省份选择变化
    provinceSelect.addEventListener('change', function() {
        const provinceId = this.value;
        
        // 清空城市和区县选择
        citySelect.innerHTML = '<option value="">---------</option>';
        if (districtSelect) {
            districtSelect.innerHTML = '<option value="">---------</option>';
        }
        
        // 如果没有选择省份，直接返回
        if (!provinceId) {
            return;
        }
        
        // 获取该省份下的城市列表
        fetch(`/api/marathon/city/?province=${provinceId}`)
            .then(response => response.json())
            .then(data => {
                // 添加城市选项
                data.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.id;
                    option.textContent = city.name;
                    citySelect.appendChild(option);
                });
                
                // 如果有初始值，尝试选中
                if (initialCity) {
                    citySelect.value = initialCity;
                    // 触发城市变化事件，加载区县
                    citySelect.dispatchEvent(new Event('change'));
                }
            })
            .catch(error => {
                console.error('获取城市列表失败:', error);
            });
    });
    
    // 监听城市选择变化
    if (districtSelect) {
        citySelect.addEventListener('change', function() {
            const cityId = this.value;
            
            // 清空区县选择
            districtSelect.innerHTML = '<option value="">---------</option>';
            
            // 如果没有选择城市，直接返回
            if (!cityId) {
                return;
            }
            
            // 获取该城市下的区县列表
            fetch(`/api/marathon/district/?city=${cityId}`)
                .then(response => response.json())
                .then(data => {
                    // 添加区县选项
                    data.forEach(district => {
                        const option = document.createElement('option');
                        option.value = district.id;
                        option.textContent = district.name;
                        districtSelect.appendChild(option);
                    });
                    
                    // 如果有初始值，尝试选中
                    if (initialDistrict) {
                        districtSelect.value = initialDistrict;
                    }
                })
                .catch(error => {
                    console.error('获取区县列表失败:', error);
                });
        });
    }
    
    // 页面加载时，如果已经选择了省份，触发加载城市
    if (provinceSelect.value) {
        provinceSelect.dispatchEvent(new Event('change'));
    }
});
