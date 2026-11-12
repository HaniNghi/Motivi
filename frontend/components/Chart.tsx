import { useState } from "react";
import { DaySummary, WeekAnalytics } from "../lib/types";
import colors from "../styles/colors";
import WhiteContainer from "./WhiteContainer";
import { BarChart } from "react-native-gifted-charts";
import { getDate } from "../lib/utils";
import { DimensionValue, View } from "react-native";

interface BarChartProps {
  rawData: WeekAnalytics | null;
  width?: number;
  small?: boolean;
}

export default function Chart({ rawData, width, small = false }: BarChartProps) {
  const todayStr = getDate();
  const targetValue = rawData?.target_calories ?? 0;

  const colorsOfBarChart = (day?: DaySummary) => {
    const value = day?.calories ?? 0;
    if (!value || value === 0) {
      return [colors.page, colors.page];
    }
    if (day?.date === todayStr) {
      return [colors.primaryGradient[0], colors.primaryGradient[1]]; // Today's color
    }
    if (value >= targetValue) {
      return [colors.carbsGradient[0], colors.carbsGradient[1]];
    }
    return [colors.fatsGradient[0], colors.fatsGradient[1]];
  };
  const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const data = LABELS.map((label, index) => {
    const day = rawData?.days?.[index];
    const [frontColor, gradientColor] = colorsOfBarChart(day);
    return {
      label: label,
      value: day?.calories ?? 0,
      frontColor: frontColor,
      gradientColor: gradientColor,
    };
  });

  const maxBarValue = Math.max(...data.map((d) => d.value), 0);
  const chartMaxValue = Math.max(maxBarValue, targetValue, 100) * 1.15;

  const referenceLine1Config = {
    color: colors.text,
    thickness: 1,
    labelText: `${targetValue}`,
    labelTextStyle: {
      color: colors.textMuted,
      fontSize: 10,
      right: 0,
      top: -15,
    },
  };
  const labelsStyle = {
    color: colors.textMuted,
  };

  const yAxisTextStyle = {
    color: colors.textMuted,
    fontSize: 8,
  };
  return (
    <View>
      {small ? (
        <BarChart
          data={data}
          showGradient
          barBorderRadius={4}
          maxValue={maxBarValue}
          hideRules={true}
          yAxisColor={colors.textWhite}
          xAxisColor={colors.textWhite}
          xAxisLabelTextStyle={labelsStyle}
          hideYAxisText={true}
          barWidth={20}
          height={30}
          minHeight={2}
        />
      ) : (
        <BarChart
          data={data}
          showGradient
          barBorderRadius={4}
          maxValue={chartMaxValue}
          minHeight={10}
          referenceLine1Position={targetValue}
          showReferenceLine1={true}
          referenceLine1Config={referenceLine1Config}
          hideRules={true}
          yAxisColor={colors.textMuted}
          xAxisColor={colors.textWhite}
          xAxisLabelTextStyle={labelsStyle}
          yAxisTextStyle={yAxisTextStyle}
          formatYLabel={(label) => `${Math.round(Number(label))}`}
          adjustToWidth={true}
          parentWidth={width}
        />
      )}
    </View>
  );
}
