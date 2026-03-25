import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { CreateMarketDto } from './dto/create-market.dto';
import { ResolveMarketDto } from './dto/resolve-market.dto';
import { QueryMarketsDto } from './dto/query-markets.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Markets')
@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @ApiOperation({ summary: 'Get all markets' })
  @Get()
  findAll(@Query() query: QueryMarketsDto) {
    return this.marketsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a single market by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new market' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() dto: CreateMarketDto) {
    return this.marketsService.create(req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Resolve a market' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: ResolveMarketDto,
  ) {
    return this.marketsService.resolve(id, req.user.sub, dto);
  }

  @ApiOperation({ summary: 'Cancel a market' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req) {
    return this.marketsService.cancel(id, req.user.sub);
  }
}
