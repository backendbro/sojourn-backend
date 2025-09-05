import * as crypto from 'crypto';

import { HashingAlgorithm } from './';

export class Crypto {
  public static hashify(
    hashingAlgorithm: HashingAlgorithm,
    data: string,
  ): Promise<string> {
    return new Promise((res, rej) => {
      const hash = crypto.createHash(hashingAlgorithm);

      hash.on('readable', () => {
        const data = hash.read();
        if (data) {
          res(data.toString());
        } else {
          rej(-1);
        }
      });

      hash.write(data);
      hash.end();
    });
  }
}
