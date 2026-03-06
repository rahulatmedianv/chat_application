import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('dm_message')
export class DmMessageEntity {
    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column({ type: 'varchar', length: 100 })
    public sender!: string;

    @Column({ type: 'varchar', length: 100 })
    public receiver!: string;

    @Column({ type: 'text' })
    public message!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    public createdAt!: Date;
}

