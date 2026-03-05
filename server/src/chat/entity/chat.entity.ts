import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('chat_message')
export class ChatMessageEntity {
    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column({ type: 'varchar', length: 100 })
    public author!: string;

    @Column({ type: 'text' })
    public body!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    public createdAt!: Date;
}
