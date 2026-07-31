export function getDate(monthsFromNow: number): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsFromNow);
    return date;
}