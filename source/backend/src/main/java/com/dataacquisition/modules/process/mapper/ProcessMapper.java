package com.dataacquisition.modules.process.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataacquisition.modules.process.entity.Process;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工序Mapper
 */
@Mapper
public interface ProcessMapper extends BaseMapper<Process> {
}
