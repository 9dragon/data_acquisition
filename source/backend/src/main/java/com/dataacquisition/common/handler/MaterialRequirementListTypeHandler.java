package com.dataacquisition.common.handler;

import com.dataacquisition.modules.system.entity.MaterialRequirement;
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
 * 资料需求列表JSON类型处理器
 */
@MappedTypes(List.class)
@MappedJdbcTypes(JdbcType.VARCHAR)
public class MaterialRequirementListTypeHandler extends BaseTypeHandler<List<MaterialRequirement>> {

    private static final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    private static final TypeReference<List<MaterialRequirement>> typeRef = new TypeReference<List<MaterialRequirement>>() {};

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<MaterialRequirement> parameter, JdbcType jdbcType) throws SQLException {
        try {
            ps.setString(i, objectMapper.writeValueAsString(parameter));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON序列化失败: " + e.getMessage(), e);
        }
    }

    @Override
    public List<MaterialRequirement> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String json = rs.getString(columnName);
        return parseJson(json);
    }

    @Override
    public List<MaterialRequirement> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String json = rs.getString(columnIndex);
        return parseJson(json);
    }

    @Override
    public List<MaterialRequirement> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return null;
    }

    private List<MaterialRequirement> parseJson(String json) {
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
