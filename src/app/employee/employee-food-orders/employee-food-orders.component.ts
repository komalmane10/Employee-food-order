import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../common/services/spinner.service';
import { EmployeeFoodOrdersService } from './../employee-food-orders.service';

@Component({
  selector: 'app-employee-food-orders',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './employee-food-orders.component.html',
  styleUrls: ['./employee-food-orders.component.scss']
})
export class EmployeeFoodOrdersComponent implements OnInit {
  user: any = null;
  foodOrders: any[] = [];
  totalFine = 0;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages!: number;
  isOnline: boolean = true;
  isLoading: boolean = false;
  monthForm!: FormGroup;

  constructor(private employeeFoodOrdersService: EmployeeFoodOrdersService,
    private spinnerService: SpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getEmployeeFoodData(10);
    this.spinnerService.getLoadingState().subscribe((isLoading: any) => {
      this.isLoading = isLoading;
    });
    this.monthForm = this.fb.group({
      month: [
        '', 
        [
          Validators.required, 
          Validators.min(1), 
          Validators.max(12), 
          Validators.pattern('^(0[1-9]|1[0-2])$') 
        ]
      ]
    });
  }

  public getEmployeeFoodData(monthValue: number): void {
    const payload = {
      month: monthValue
    }
    this.employeeFoodOrdersService.getMonthlyFoodOrders(payload).subscribe((response) => {
      this.user = response.user;
      this.foodOrders = response.reports.map((report: any) => ({
        date: report.date,
        breakfast: report.opt_ins?.breakfast || '-',
        lunch: report.opt_ins?.lunch || '-',
        dinner: report.opt_ins?.dinner || '-',
      }));

      this.calculateFine();
      this.totalPages = Math.ceil(this.foodOrders.length / this.itemsPerPage);
    });
  }

  private calculateFine(): void {
    this.totalFine = this.foodOrders.reduce((total, order) => {
      ['breakfast', 'lunch', 'dinner'].forEach((meal) => {
        if (order[meal] === 'Pending') {
          total += 100;
        }
      });
      return total;
    }, 0);
  }

  get paginatedFoodOrders() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.foodOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  public nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  public prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  public firstPage(): void {
    this.currentPage = 1;
  }

  public lastPage(): void {
    this.currentPage = this.totalPages;
  }


 

}
