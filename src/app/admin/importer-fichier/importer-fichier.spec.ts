import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImporterFichierComponent } from './importer-fichier';

describe('ImporterFichier', () => {
  let component: ImporterFichierComponent;
  let fixture: ComponentFixture<ImporterFichierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImporterFichierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImporterFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
