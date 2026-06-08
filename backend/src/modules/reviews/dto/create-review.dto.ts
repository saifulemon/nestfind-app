import { IsString, IsNumber, IsOptional, Min, Max, Length } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  @Length(0, 200)
  title?: string;

  @IsString()
  @Length(3, 2000)
  comment: string;
}
