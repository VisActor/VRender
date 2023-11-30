import type { interfaces } from '../interfaces/interfaces';

class QueryableString implements interfaces.QueryableString {
  private str: string;

  constructor(str: string) {
    this.str = str;
  }

  // startsWith(searchString: string): boolean {
  //   return this.str.indexOf(searchString) === 0;
  // }

  // endsWith(searchString: string): boolean {
  //   let reverseString = '';
  //   const reverseSearchString = searchString.split('').reverse().join('');
  //   reverseString = this.str.split('').reverse().join('');
  //   return this.startsWith.call({ str: reverseString }, reverseSearchString);
  // }

  contains(searchString: string): boolean {
    return this.str.indexOf(searchString) !== -1;
  }

  equals(compareString: string): boolean {
    return this.str === compareString;
  }

  value(): string {
    return this.str;
  }
}

export { QueryableString };
