#!/bin/bash
# Instala o cron job de atualização WhatsApp (48h)
# Rodar uma vez no VPS: bash /opt/ecosistema-max/scripts/instalar-cron-zapi.sh

SCRIPT="/opt/ecosistema-max/scripts/zapi-update.js"
LOG="/var/log/zapi-update.log"
CRON_JOB="0 9 */2 * * /usr/bin/node $SCRIPT >> $LOG 2>&1"

# Cria arquivo de log se não existir
touch $LOG

# Adiciona ao crontab do root (se ainda não existir)
( crontab -l 2>/dev/null | grep -v "zapi-update" ; echo "$CRON_JOB" ) | crontab -

echo "✓ Cron instalado: a cada 48h às 9h"
echo "  Script: $SCRIPT"
echo "  Log:    $LOG"
echo ""
echo "Testando envio imediato..."
node $SCRIPT
