import {Component} from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <div class="card-container">
            <app-phone></app-phone>
        </div>
    `,
    styles: [`
      .card-container {
        min-width: 120px;
        max-width: 600px;
        margin: 20px auto;
      }
    `]
})
export class AppComponent {
    title = 'angular-material-phone';
}
