import { Injectable } from '@angular/core';
import { IGenericResponse } from '@app/dashboard/services/generic-websocket.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DecryptService {
  constructor() {}

  // base64 encoded key random 32 bytes
  private key: string = 'J9AXvEamvlPX5XXhAeJtLg==';

  decrypt<T>(
    genericResponse: IGenericResponse<T>
  ): Observable<IGenericResponse<T>> {
    return new Observable<IGenericResponse<T>>((observer) => {
      const decodedCiphertext = Uint8Array.from(
        atob(genericResponse.data as any),
        (c) => c.charCodeAt(0)
      );
      if (!genericResponse.encrypted) {
        // decode the base64-encoded genericResponse
        observer.next({
          type: genericResponse.type,
          data: JSON.parse(new TextDecoder().decode(decodedCiphertext) as any),
          encrypted: false,
        });
        observer.complete();
      } else {
        const decodedKey = Uint8Array.from(atob(this.key), (c) =>
          c.charCodeAt(0)
        );

        // import the key
        crypto.subtle
          .importKey('raw', decodedKey, 'AES-CTR', false, ['decrypt'])
          .then((key) => {
            // create a crypto object with a zero IV
            const iv = new Uint8Array(16);
            const cryptoObject = { name: 'AES-CTR', counter: iv, length: 128 };

            // decrypt the genericResponse
            crypto.subtle
              .decrypt(cryptoObject, key, decodedCiphertext)
              .then((decrypted) => {
                // emit the decrypted plaintext
                observer.next({
                  type: genericResponse.type,
                  data: JSON.parse(new TextDecoder().decode(decrypted) as any),
                  encrypted: false,
                });
                observer.complete();
              })
              .catch((error) => observer.error(error));
          });
      }
    });
  }
}
