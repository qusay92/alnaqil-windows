import { Pipe, PipeTransform } from '@angular/core';

// The API returns statuses in mixed forms ("Bought New", "Loaded", "Awaiting Load",
// "arrived", ...). Normalise them to one key: boughtnew | loaded | arrived | awaitingload | departured.
export function normalizeStatus(value: string | null | undefined): string {
  return (value || '').toString().toLowerCase().replace(/\s+/g, '');
}

// Use with the translate pipe: {{ item.carStatusStr | statusKey | translate }}
@Pipe({ name: 'statusKey' })
export class StatusKeyPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    const key = normalizeStatus(value);
    return key ? 'Status.' + key : '';
  }
}
