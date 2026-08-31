import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { ADMIN_HTML_TEMPLATE } from './admin-html.template';
import { ADMIN_JS_TEMPLATE } from './admin-js.template';

@Controller('admin')
export class AdminWebController {
  @Get('build-info')
  @ApiExcludeEndpoint()
  getBuildInfo() {
    return {
      app: 'HK Connect',
      adminBuild: 'HK-ADMIN-ROUTE-WIZARD-02',
      buildTimestamp: new Date().toISOString(),
      railwayCommitSha: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || null,
      nodeEnv: process.env.NODE_ENV || 'development',
    };
  }

  @Get(['', '/', 'dashboard', 'users', 'drivers', 'vehicles', 'trips'])
  @ApiExcludeEndpoint()
  serveAdminApp(@Res() res: Response) {
    const fullHtml = `${ADMIN_HTML_TEMPLATE}\n  <script>\n${ADMIN_JS_TEMPLATE}\n  </script>\n</body>\n</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src-attr 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; font-src 'self' data: https:;",
    );
    return res.send(fullHtml);
  }
}
