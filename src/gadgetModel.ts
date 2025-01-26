import { 
  Table, 
  Column, 
  Model, 
  DataType, 
  PrimaryKey,
  Default,
  IsUUID
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

export enum GadgetStatus {
  AVAILABLE = 'Available',
  DEPLOYED = 'Deployed',
  DESTROYED = 'Destroyed',
  DECOMMISSIONED = 'Decommissioned'
}

@Table({
  tableName: 'gadgets',
  timestamps: true
})
export class Gadget extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @IsUUID(4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  codename!: string;

  @Column({
    type: DataType.ENUM(...Object.values(GadgetStatus)),
    allowNull: false,
    defaultValue: GadgetStatus.AVAILABLE
  })
  status!: GadgetStatus;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
    validate: {
      min: 0,
      max: 100
    }
  })
  missionSuccessProbability!: number;

  @Column(DataType.DATE)
  decommissionedAt?: Date;
}