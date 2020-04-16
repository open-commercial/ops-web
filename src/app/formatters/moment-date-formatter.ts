import * as moment from 'moment';

export class MomentDateFormatter {
  readonly DT_FORMAT = 'DD/MM/YYYY';

  parse(value: string) {
    if (value) {
      value = value.trim();
      const mdt = moment(value, this.DT_FORMAT);
      return { year: mdt.year(), month: mdt.month(), day: mdt.date() };
    }
    return null;
  }

  format(date): string {
    if (!date) { return ''; }
    const mdt = moment([date.year, date.month - 1, date.day]);
    if (!mdt.isValid()) { return ''; }
    return mdt.format(this.DT_FORMAT);
  }
}
