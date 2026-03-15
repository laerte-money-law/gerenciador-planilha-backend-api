import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from '../../team/model/team.entity';

@Entity('client')
export class Client {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  cnpj: string;

  @Column({ name: 'nomeEmpresa'})
  companyName: string;

  @Column({ name: 'endereco', nullable: true })
  address: string;

  @Column({ name: 'bairro', nullable: true })
  neighborhood: string;

  @Column({ name: 'cidade', nullable: true })
  city: string;

  @Column({ name: 'uf', nullable: true })
  state: string;

  @Column({ nullable: true })
  cep: string;

  @Column({ name: 'nomeContato', nullable: true })
  contactName: string;

  @Column({ name: 'foneContato', nullable: true })
  contactPhone: string;

  @Column({ name: 'emailContato', nullable: true })
  contactEmail: string;

  @OneToMany(() => Team, (team) => team.client)
  teams: Team[];
}
