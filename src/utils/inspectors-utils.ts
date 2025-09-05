import { IInspectors } from 'src/inspectors/types';

interface Inspectors extends IInspectors {
  createdAt: Date;
}

export function formatInspectors(inspectors: Inspectors[]) {
  return inspectors.map((inspector) => ({
    ...inspector,
    phone: inspector.phoneNumber,
    date: new Date(inspector.createdAt).toDateString(),
  }));
}
