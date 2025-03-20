import { Component, Input} from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings-item',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, RouterLink],
  templateUrl: './settings-item.component.html',
  styleUrl: './settings-item.component.scss'
})
export class SettingsItemComponent {
@Input() icon?: IconDefinition;
@Input() label?: string;
@Input() routePath?: string;

public angleRightIcon = faAngleRight;
}
