package com.dataacquisition.modules.workshop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.workshop.entity.Workshop;
import org.apache.ibatis.annotations.Mapper;

/**
 * 车间Mapper
 */
@Mapper
public interface WorkshopMapper extends BaseMapper<Workshop> {
}
