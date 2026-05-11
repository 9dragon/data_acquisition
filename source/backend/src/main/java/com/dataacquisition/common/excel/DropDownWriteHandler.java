package com.dataacquisition.common.excel;

import com.alibaba.excel.write.handler.SheetWriteHandler;
import com.alibaba.excel.write.metadata.holder.WriteSheetHolder;
import com.alibaba.excel.write.metadata.holder.WriteWorkbookHolder;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;

import java.util.List;
import java.util.Map;

/**
 * Excel下拉框数据校验写入处理器
 * <p>
 * 通过EasyExcel的SheetWriteHandler机制，在Sheet创建后添加POI DataValidation。
 * 自动判断选项长度：短列表用内联方式，长列表用隐藏Sheet+命名范围引用。
 */
public class DropDownWriteHandler implements SheetWriteHandler {

    private static final String HIDDEN_SHEET_PREFIX = "_dropdown_";
    private static final int INLINE_CHAR_LIMIT = 255;
    private static final int FIRST_ROW = 1;
    private static final int LAST_ROW = 999;

    private final Map<Integer, List<String>> dropDownMap;

    public DropDownWriteHandler(Map<Integer, List<String>> dropDownMap) {
        this.dropDownMap = dropDownMap;
    }

    @Override
    public void afterSheetCreate(WriteWorkbookHolder writeWorkbookHolder,
                                 WriteSheetHolder writeSheetHolder) {
        if (dropDownMap == null || dropDownMap.isEmpty()) {
            return;
        }

        Workbook workbook = writeWorkbookHolder.getWorkbook();
        Sheet sheet = writeSheetHolder.getSheet();
        int hiddenSheetIndex = 0;

        for (Map.Entry<Integer, List<String>> entry : dropDownMap.entrySet()) {
            int colIndex = entry.getKey();
            List<String> options = entry.getValue();

            if (options == null || options.isEmpty()) {
                continue;
            }

            int totalLength = options.stream().mapToInt(String::length).sum()
                    + options.size() - 1;

            if (totalLength <= INLINE_CHAR_LIMIT) {
                addInlineValidation(sheet, colIndex, options);
            } else {
                String hiddenSheetName = HIDDEN_SHEET_PREFIX + hiddenSheetIndex;
                addHiddenSheetValidation(workbook, sheet, colIndex, options, hiddenSheetName);
                hiddenSheetIndex++;
            }
        }
    }

    private void addInlineValidation(Sheet sheet, int colIndex, List<String> options) {
        String[] optionArray = options.toArray(new String[0]);
        DataValidationHelper helper = sheet.getDataValidationHelper();
        DataValidationConstraint constraint = helper.createExplicitListConstraint(optionArray);

        CellRangeAddressList addressList = new CellRangeAddressList(FIRST_ROW, LAST_ROW, colIndex, colIndex);
        DataValidation validation = helper.createValidation(constraint, addressList);
        setValidationErrorStyle(validation);

        sheet.addValidationData(validation);
    }

    private void addHiddenSheetValidation(Workbook workbook, Sheet sheet,
                                          int colIndex, List<String> options,
                                          String hiddenSheetName) {
        // 创建隐藏Sheet并写入选项
        Sheet hiddenSheet = workbook.createSheet(hiddenSheetName);
        for (int i = 0; i < options.size(); i++) {
            Row row = hiddenSheet.createRow(i);
            row.createCell(0).setCellValue(options.get(i));
        }

        // 创建命名范围
        String rangeName = hiddenSheetName + "_range";
        Name namedRange = workbook.createName();
        namedRange.setNameName(rangeName);
        namedRange.setRefersToFormula(hiddenSheetName + "!$A$1:$A$" + options.size());

        // 在数据Sheet上创建引用命名范围的校验
        DataValidationHelper helper = sheet.getDataValidationHelper();
        DataValidationConstraint constraint = helper.createFormulaListConstraint(rangeName);

        CellRangeAddressList addressList = new CellRangeAddressList(FIRST_ROW, LAST_ROW, colIndex, colIndex);
        DataValidation validation = helper.createValidation(constraint, addressList);
        setValidationErrorStyle(validation);

        sheet.addValidationData(validation);

        // 隐藏Sheet
        workbook.setSheetHidden(workbook.getSheetIndex(hiddenSheetName), true);
    }

    private void setValidationErrorStyle(DataValidation validation) {
        validation.setShowErrorBox(true);
        validation.setErrorStyle(DataValidation.ErrorStyle.STOP);
        validation.createErrorBox("输入错误", "请从下拉列表中选择有效选项");
        validation.setShowPromptBox(true);
    }
}
