import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'CPF ou Telefone do usuário', example: '38920184910' })
  @IsNotEmpty({ message: 'O CPF ou telefone é obrigatório' })
  @IsString()
  phone_or_cpf: string;

  @ApiProperty({ description: 'Senha de acesso', example: 'senha123' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;
}
