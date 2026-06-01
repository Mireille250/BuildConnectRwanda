import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchProfessionalsDto } from './dto/search-professionals.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * GET /api/v1/search/professionals
   *
   * Query params (all optional):
   *   profession    - e.g. "Civil Engineer"
   *   district      - e.g. "Gasabo"
   *   skill         - e.g. "AutoCAD"
   *   minExperience - e.g. 3
   *   minRating     - e.g. 4
   *   available     - true/false
   *   verified      - true/false
   *   sortBy        - "rating" | "experience"
   *   order         - "asc" | "desc"
   *   page          - default 1
   *   limit         - default 10, max 50
   */
  @Get('professionals')
  searchProfessionals(@Query() query: SearchProfessionalsDto) {
    return this.searchService.searchProfessionals(query);
  }
}