import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockItemsService {

   // Mock data
  private mockData = ['apple', 'banana', 'cherry', 'date', 'elderberry'];

   // Method to mimic HttpClient.get
  getItems(query: string): Observable<string[]> {
    const filteredItems = this.mockData.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
    return of(filteredItems);
  }
}
