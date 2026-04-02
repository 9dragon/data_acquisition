package com.dataacquisition.common.handler;

import com.dataacquisition.modules.system.entity.StageTaskTemplate;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * 阶段任务模板列表JSON类型处理器
 */
@MappedTypes(List.class)
@MappedJdbcTypes(JdbcType.VARCHAR)
public class StageTaskTemplateListTypeHandler extends BaseTypeHandler<List<StageTaskTemplate>> {

    private static final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    private static final TypeReference<List<StageTaskTemplate>> typeRef = new TypeReference<List<StageTaskTemplate>>() {};

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<StageTaskTemplate> parameter, JdbcType jdbcType) throws SQLException {
        try {
            ps.setString(i, objectMapper.writeValueAsString(parameter));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON序列化失败: " + e.getMessage(), e);
        }
    }

    @Override
    public List<StageTaskTemplate> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String json = rs.getString(columnName);
        return parseJson(json);
    }

    @Override
    public List<StageTaskTemplate> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String json = rs.getString(columnIndex);
        return parseJson(json);
    }

    @Override
    public List<StageTaskTemplate> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return null;
    }

    private List<StageTaskTemplate> parseJson(String json) {
        try {
            if (json == null || json.isEmpty()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(json, typeRef);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON解析失败: " + e.getMessage(), e);
        }
    }
}
