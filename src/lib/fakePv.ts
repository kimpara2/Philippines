// storeId + 年月 → 決定論的に5000〜9999の値を返す（ダミーPV）
export function getMonthlyPv(storeId: string, year: number, month: number): number {
  const seed = storeId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    + year * 100 + month;
  return 5000 + Math.abs((seed * 1103515245 + 12345) % 5000);
}

// 直近3ヶ月（先月・先々月・3ヶ月前）の { label, pv } を返す
export function getRecentMonthsPv(storeId: string) {
  const now = new Date();
  return [1, 2, 3].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return {
      label: `${month}月`,
      pv: getMonthlyPv(storeId, year, month),
    };
  });
}
