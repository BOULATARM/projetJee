resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "${var.app_name}-db-subnet-group" }
}

resource "aws_db_instance" "mysql" {
  identifier             = "${var.app_name}-mysql"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = var.db_instance_class
  allocated_storage  = 20
  storage_encrypted  = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 0
  maintenance_window      = "Mon:03:00-Mon:04:00"

  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.app_name}-mysql-final-snapshot"
  deletion_protection       = true

  tags = { Name = "${var.app_name}-mysql" }
}
