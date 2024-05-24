import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import * as config from 'config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from './user.repository';
import { User } from './user.entity';

const jwtConfig = config.get('jwt');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {
    super({
      secretOrKey: jwtConfig.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: { username: string }) {
    const { username } = payload;
    const user: User = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
